import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test, { after } from "node:test";
import { createRequestHandler, resolveRequestPath } from "../scripts/serve.mjs";

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "bilingual-site-"));
const siteRoot = path.join(temporaryRoot, "_site");
const siblingRoot = path.join(temporaryRoot, "_site-copy");
fs.mkdirSync(path.join(siteRoot, "docs"), { recursive: true });
fs.mkdirSync(siblingRoot, { recursive: true });
fs.writeFileSync(path.join(siteRoot, "index.html"), "home");
fs.writeFileSync(path.join(siteRoot, "404.html"), "missing");
fs.writeFileSync(path.join(siteRoot, "docs", "index.html"), "docs");
fs.writeFileSync(path.join(siteRoot, "styles.css"), "body {}");
fs.writeFileSync(path.join(siteRoot, "download.bin"), "binary");
fs.writeFileSync(path.join(siblingRoot, "secret.txt"), "secret");

after(() => fs.rmSync(temporaryRoot, { recursive: true, force: true }));

function captureResponse() {
  return {
    status: null,
    headers: null,
    body: null,
    writeHead(status, headers) {
      this.status = status;
      this.headers = headers;
    },
    end(body) {
      this.body = body?.toString() ?? "";
    },
  };
}

test("resolves root files and directory indexes", () => {
  assert.equal(resolveRequestPath("/", siteRoot), fs.realpathSync(path.join(siteRoot, "index.html")));
  assert.equal(
    resolveRequestPath("/docs/", siteRoot),
    fs.realpathSync(path.join(siteRoot, "docs", "index.html")),
  );
});

test("blocks encoded traversal into a similarly named sibling", () => {
  assert.equal(resolveRequestPath("/..%2f_site-copy/secret.txt", siteRoot), null);
});

test("blocks symbolic links that resolve outside the site", (context) => {
  const outsideDirectory = path.join(temporaryRoot, "outside");
  const linkPath = path.join(siteRoot, "outside-link");
  fs.mkdirSync(outsideDirectory);
  fs.writeFileSync(path.join(outsideDirectory, "index.html"), "outside");

  try {
    fs.symlinkSync(outsideDirectory, linkPath, "junction");
  } catch (error) {
    if (error.code === "EPERM") {
      context.skip("symbolic-link creation is unavailable on this Windows host");
      return;
    }
    throw error;
  }

  assert.equal(resolveRequestPath("/outside-link/", siteRoot), null);
});

test("returns 400 for malformed URL encoding", () => {
  const response = captureResponse();
  createRequestHandler(siteRoot)({ url: "/%" }, response);
  assert.equal(response.status, 400);
  assert.equal(response.body, "Bad request");
});

test("serves known and fallback content types", () => {
  const cssResponse = captureResponse();
  createRequestHandler(siteRoot)({ url: "/styles.css" }, cssResponse);
  assert.equal(cssResponse.status, 200);
  assert.equal(cssResponse.headers["content-type"], "text/css; charset=utf-8");

  const binaryResponse = captureResponse();
  createRequestHandler(siteRoot)({ url: "/download.bin" }, binaryResponse);
  assert.equal(binaryResponse.status, 200);
  assert.equal(binaryResponse.headers["content-type"], "application/octet-stream");
});

test("uses the bilingual 404 page for missing files", () => {
  const response = captureResponse();
  createRequestHandler(siteRoot)({ url: "/missing" }, response);
  assert.equal(response.status, 404);
  assert.equal(response.body, "missing");
});
