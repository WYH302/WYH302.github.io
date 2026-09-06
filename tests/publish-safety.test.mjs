import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";
import {
  assertSafePublishSource,
  assetExtensions,
  htmlExtensions,
  validateCname,
} from "../scripts/publish-safety.mjs";

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "publish-safety-"));
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = new Map([
  ["page.html", "<main></main>"],
  ["resume-cv-bbox.html", "email@example.com 13500000000"],
  ["image.png", "image"],
  ["config.json", "{\"token\":\"secret\"}"],
  ["notes.txt", "private notes"],
  ["resume.pdf", "private resume"],
  [".env.local", "TOKEN=secret"],
]);
for (const [name, content] of files) {
  fs.writeFileSync(path.join(temporaryRoot, name), content);
}

after(() => fs.rmSync(temporaryRoot, { recursive: true, force: true }));

test("allows only HTML in content trees and web assets in assets", () => {
  assert.doesNotThrow(() =>
    assertSafePublishSource(path.join(temporaryRoot, "page.html"), temporaryRoot, htmlExtensions),
  );
  assert.doesNotThrow(() =>
    assertSafePublishSource(path.join(temporaryRoot, "image.png"), temporaryRoot, assetExtensions),
  );
  assert.throws(
    () => assertSafePublishSource(path.join(temporaryRoot, "config.json"), temporaryRoot, assetExtensions),
    /unexpected publish file type/,
  );
  assert.throws(
    () => assertSafePublishSource(path.join(temporaryRoot, "notes.txt"), temporaryRoot, htmlExtensions),
    /unexpected publish file type/,
  );
});

test("rejects sensitive extensions and environment files", () => {
  assert.throws(
    () => assertSafePublishSource(path.join(temporaryRoot, "resume.pdf"), temporaryRoot),
    /sensitive file type/,
  );
  assert.throws(
    () => assertSafePublishSource(path.join(temporaryRoot, ".env.local"), temporaryRoot),
    /sensitive file type/,
  );
});

test("rejects the local CV PDF as a publishable asset", () => {
  const publicCv = path.join(temporaryRoot, "assets", "files", "cv.pdf");
  fs.mkdirSync(path.dirname(publicCv), { recursive: true });
  fs.writeFileSync(publicCv, "audited public CV fixture");

  assert.throws(() =>
    assertSafePublishSource(publicCv, temporaryRoot, assetExtensions), /sensitive file type/,
  );
  assert.throws(
    () => assertSafePublishSource(path.join(temporaryRoot, "resume.pdf"), temporaryRoot),
    /sensitive file type/,
  );
});

test("rejects OCR bounding-box HTML exports", () => {
  assert.throws(
    () => assertSafePublishSource(
      path.join(temporaryRoot, "resume-cv-bbox.html"),
      temporaryRoot,
      htmlExtensions,
    ),
    /generated OCR HTML/,
  );

  const gitignore = fs.readFileSync(path.join(repositoryRoot, ".gitignore"), "utf8");
  assert.match(gitignore, /^\*-bbox\.html$/m);
});

test("rejects symbolic links in publish sources", () => {
  const sourceDirectory = path.join(temporaryRoot, "linked-source");
  const linkPath = path.join(temporaryRoot, "linked-directory");
  fs.mkdirSync(sourceDirectory);
  fs.symlinkSync(sourceDirectory, linkPath, "junction");

  assert.throws(
    () => assertSafePublishSource(linkPath, temporaryRoot),
    /symbolic link/,
  );
});

test("accepts one valid CNAME hostname and rejects extra content", () => {
  assert.equal(validateCname("www.example.com"), "www.example.com");
  assert.equal(validateCname("www.example.com\n"), "www.example.com");
  assert.equal(validateCname("www.example.com\r\n"), "www.example.com");
  assert.throws(() => validateCname(" www.example.com"), /one valid hostname/);
  assert.throws(() => validateCname("www.example.com\nextra.example.com"), /one valid hostname/);
  assert.throws(() => validateCname("TOKEN=secret"), /one valid hostname/);
});

test("sensitive source directories stay ignored", () => {
  const gitignore = fs.readFileSync(path.join(repositoryRoot, ".gitignore"), "utf8");
  for (const directory of [
    "Masters_recommendletter/",
    "Overseas_recommendletter/",
    "Undergraduate_recommendletter/",
    "backups/",
  ]) {
    assert.match(gitignore, new RegExp(`^${directory.replace("/", "\\/")}$`, "m"));
  }
});
