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
const forbiddenAdvisorLabels = /<dt>Advisor<\/dt>|<dt>导师<\/dt>|Advisor:|导师：/i;

test("published pages omit advisor fields and identify only the site owner in author metadata", () => {
  assert.equal(publicHtmlRoutes.length, 53);
  for (const route of publicHtmlRoutes) {
    const html = fs.readFileSync(path.join(root, route), "utf8");
    assert.doesNotMatch(html, forbiddenAdvisorLabels, route);
    const metadata = [...html.matchAll(/<meta\s+name="author"\s+content="([^"]*)"/gi)];
    for (const match of metadata) {
      assert.match(match[1], /^Yonghao Wu(?: \(Leon\))?$|^吴永浩$/, route);
    }
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
    assert.doesNotMatch(html, forbiddenAdvisorLabels, route);
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

test("publication entries link to research records without reproducing collaborator bylines", () => {
  for (const route of ["publications/index.html", "zh/publications/index.html"]) {
    const html = fs.readFileSync(path.join(root, route), "utf8");
    // Personal role statements replace comma-separated bylines; research links remain.
    assert.doesNotMatch(html, /(?:Yonghao Wu|吴永浩)\s*[,，、]\s*[A-Z\u4e00-\u9fff]/, route);
    assert.match(html, /https:\/\/(?:doi\.org|arxiv\.org)\//, route);
  }
});
