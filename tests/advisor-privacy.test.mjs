import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { publishEntries } from "../scripts/publish-manifest.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function collectPublishedHtml(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    return [];
  }
  if (fs.statSync(absolutePath).isFile()) {
    return relativePath.endsWith(".html") ? [relativePath] : [];
  }
  return fs.readdirSync(absolutePath, { withFileTypes: true }).flatMap((entry) =>
    collectPublishedHtml(path.join(relativePath, entry.name)));
}

const publicHtmlRoutes = publishEntries.flatMap(collectPublishedHtml);
const forbiddenAdvisorIdentities =
  /李军|刘强|刘畅|Prof(?:essor)?\.?\s+(?:Jun Li|Chang Liu|Qiang Liu)|\b(?:Jun Li|Li Jun|Chang Liu|Liu Chang|Qiang Liu|Liu Qiang)\b/i;

test("published pages do not expose advisor identities", () => {
  assert.equal(publicHtmlRoutes.length, 35);
  for (const route of publicHtmlRoutes) {
    const html = fs.readFileSync(path.join(root, route), "utf8");
    assert.doesNotMatch(html, forbiddenAdvisorIdentities, route);
  }
});

test("homepages and CV pages do not expose advisor fields", () => {
  const pages = [
    "index.html",
    "cv/index.html",
    "zh/index.html",
    "zh/cv/index.html",
  ];

  for (const route of pages) {
    const html = fs.readFileSync(path.join(root, route), "utf8");
    assert.doesNotMatch(html, /<dt>Advisor<\/dt>|<dt>导师<\/dt>|Advisor:|导师：/, route);
  }
});

test("removing advisor details preserves the requested GPA records", () => {
  const englishCv = fs.readFileSync(path.join(root, "cv/index.html"), "utf8");
  const chineseCv = fs.readFileSync(path.join(root, "zh/cv/index.html"), "utf8");

  assert.match(englishCv, /GPA: 3\.71\/5\.00, top 5%\./);
  assert.match(englishCv, /GPA: 3\.88\/5\.00, top 3%\./);
  assert.match(chineseCv, /GPA：3\.71\/5\.00，前 5%。/);
  assert.match(chineseCv, /GPA：3\.88\/5\.00，前 3%。/);
});
