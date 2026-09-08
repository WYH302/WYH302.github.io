import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { addPublicationImages, researchPhotos, publicationImageRules } from "../scripts/publication-images.mjs";

test("all 28 research entries have matching bilingual illustrations without changing their content", () => {
  let englishKeys;
  for (const route of ["publications/index.html", "zh/publications/index.html"]) {
    const source = fs.readFileSync(new URL("../" + route, import.meta.url), "utf8");
    const html = addPublicationImages(source, route);
    const keys = [...html.matchAll(/data-publication-image="([^"]+)"/g)].map(m => m[1]);
    assert.equal(keys.length, 28, route);
    assert.equal(publicationImageRules.length, 28);
    if (englishKeys) assert.deepEqual(keys, englishKeys);
    else englishKeys = keys;
    for (const m of source.matchAll(/<article[^>]*>([\s\S]*?)<\/article>/g)) assert(html.includes(m[1]), route);
    assert.equal((html.match(/data-research-lightbox/g) || []).length, 28);
    assert.equal((html.match(/loading="lazy"/g) || []).length, 28);
    assert.match(html, route.startsWith("zh/") ? /非研究结果/ : /not a research result/);
    assert.doesNotMatch(html, /<img[^>]*src="https?:/);
    for (const link of html.matchAll(/class="publication-image" href="([^"]+)"/g)) {
      assert(fs.existsSync(new URL(link[1], new URL("../" + route, import.meta.url))));
    }
  }
});

test("every mapped photo has local thumbnail and full-size versions", () => {
  for (const key of new Set(publicationImageRules.map(r => r[1]))) {
    const [file, zh, en] = researchPhotos[key];
    assert(zh && en);
    for (const suffix of ["", "-small"]) {
      assert(fs.existsSync(new URL(`../assets/images/${file}${suffix}.webp`, import.meta.url)));
    }
  }
});

test("other pages and unknown research entries remain unchanged", () => {
  const source = '<article class="feature-item"><h2>Unknown title</h2><p>Keep me</p></article>';
  assert.equal(addPublicationImages(source, "publications/index.html"), source);
  assert.equal(addPublicationImages(source, "index.html"), source);
  assert.equal(addPublicationImages('<article class="feature-item"><p>No title</p></article>', "publications/index.html"), '<article class="feature-item"><p>No title</p></article>');
});
