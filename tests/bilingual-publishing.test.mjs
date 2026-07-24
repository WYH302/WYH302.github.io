import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { postSlugs, publicUrl } from "../scripts/bilingual-routes.mjs";
import { publishEntries } from "../scripts/publish-manifest.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function occurrences(text, value) {
  return text.split(value).length - 1;
}

test("every English post directory is in the publish manifest", () => {
  for (const slug of postSlugs) {
    assert.ok(
      publishEntries.includes(`posts/${slug}`),
      `missing English publish entry for ${slug}`,
    );
  }
});

test("both blog indexes and the sitemap expose every bilingual post once", () => {
  const englishBlog = fs.readFileSync(path.join(root, "blog/index.html"), "utf8");
  const chineseBlog = fs.readFileSync(path.join(root, "zh/blog/index.html"), "utf8");
  const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");

  for (const slug of postSlugs) {
    assert.equal(occurrences(englishBlog, `../posts/${slug}/`), 1);
    assert.equal(occurrences(chineseBlog, `../posts/${slug}/`), 1);
    assert.equal(occurrences(sitemap, publicUrl(`posts/${slug}/index.html`)), 1);
    assert.equal(occurrences(sitemap, publicUrl(`zh/posts/${slug}/index.html`)), 1);
  }
});

test("the civil-service essay is published as a paired bilingual post", () => {
  const slug = "civil-service-security-and-ambition";
  const englishPost = fs.readFileSync(path.join(root, `posts/${slug}/index.html`), "utf8");
  const chinesePost = fs.readFileSync(path.join(root, `zh/posts/${slug}/index.html`), "utf8");
  const englishBlog = fs.readFileSync(path.join(root, "blog/index.html"), "utf8");
  const chineseBlog = fs.readFileSync(path.join(root, "zh/blog/index.html"), "utf8");

  assert.ok(postSlugs.includes(slug), "new essay should be in the bilingual route table");
  assert.match(englishPost, /After the civil-service exam/);
  assert.match(chinesePost, /考公之后/);
  assert.equal(occurrences(englishBlog, `../posts/${slug}/`), 1);
  assert.equal(occurrences(chineseBlog, `../posts/${slug}/`), 1);
});
