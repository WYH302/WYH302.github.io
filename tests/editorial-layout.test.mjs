import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { applyEditorialLayout, essayThemes, imageCredits } from "../scripts/editorial-layout.mjs";
import { bilingualAllRoutes, postSlugs } from "../scripts/bilingual-routes.mjs";

test("editorial layer preserves bilingual source content, dates and navigation", () => {
  for (const route of bilingualAllRoutes) {
    const source = fs.readFileSync(new URL("../" + route, import.meta.url), "utf8");
    const result = applyEditorialLayout(source, route);
    assert.equal((result.match(/editorial.css/g) || []).length, 1, route);
    assert.equal((result.match(/editorial.js/g) || []).length, 1, route);
    for (const time of source.matchAll(/<time[^>]*>[\s\S]*?<\/time>/g)) assert.ok(result.includes(time[0]), route);
    for (const href of source.matchAll(/href="(https:[^"]+|mailto:[^"]+)"/g)) assert.ok(result.includes(href[0]), route);
    assert.ok(result.includes('class="nav-list"'), route);
    if (route.includes("posts/")) {
      assert.ok(result.includes("editorial-cover"), route);
      for (const p of source.matchAll(/<p[^>]*>[\s\S]*?<\/p>/g)) assert.ok(result.includes(p[0]), route);
      const ids = [...result.matchAll(/\bid="([^"]+)"/g)].map(x => x[1]);
      assert.equal(new Set(ids).size, ids.length, route);
    }
  }
});
test("every essay has a local, licensed thematic image at two sizes", () => {
  assert.deepEqual(Object.keys(essayThemes).sort(), [...postSlugs].sort());
  for (const credit of Object.values(imageCredits)) {
    for (const suffix of ["", "-small"]) {
      assert.ok(fs.existsSync(new URL("../assets/images/" + credit.file + suffix + ".webp", import.meta.url)));
    }
    assert.ok(credit.url.startsWith("https://unsplash.com/"));
    assert.ok(credit.en && credit.zh);
  }
});
test("public pages omit optional stock-photo credits without losing source links or image descriptions", () => {
  for (const route of bilingualAllRoutes) {
    const source = fs.readFileSync(new URL("../" + route, import.meta.url), "utf8");
    const html = applyEditorialLayout(source, route);
    assert.doesNotMatch(html, /主题配图|Thematic photograph|Thematic cover photography|journal-photo-note|portrait-caption|Richard Rojas|Unsplash|Pexels/, route);
    for (const href of source.matchAll(/href="(https:[^"]+|mailto:[^"]+)"/g)) assert.ok(html.includes(href[0]), route);
    for (const img of html.matchAll(/<img\b[^>]*>/g)) assert.match(img[0], /\balt="[^"]+"/, route);
  }
  const credits = fs.readFileSync(new URL("../docs/image-credits.md", import.meta.url), "utf8");
  assert.match(credits, /Richard Rojas/);
  assert.match(credits, /https:\/\/www\.pexels\.com\/license\//);
  assert.match(credits, /https:\/\/unsplash\.com\/license/);
});
test("journal enhancements do not hide articles when JavaScript is disabled", () => {
  for (const route of ["blog/index.html", "zh/blog/index.html"]) {
    const source = fs.readFileSync(new URL("../" + route, import.meta.url), "utf8");
    const html = applyEditorialLayout(source, route);
    assert.equal((html.match(/data-category=/g) || []).length, postSlugs.length);
    assert.doesNotMatch(html, /<article[^>]*\bhidden\b/);
    assert.match(html, /data-journal-tools hidden/);
    assert.match(html, /type="search"/);
    assert.match(html, /aria-pressed="true"/);
  }
});
test("short articles and unmapped notes remain usable", () => {
  const html = '<html><head></head><body><main><h1>A note</h1><p class="lead">Hello</p><h2 id="existing">Section</h2><p>Body</p></main></body></html>';
  const output = applyEditorialLayout(html, "posts/unmapped/index.html");
  assert.doesNotMatch(output, /article-contents/);
  assert.match(output, /id="existing"/);
  assert.match(output, /Back to the beginning/);
});
