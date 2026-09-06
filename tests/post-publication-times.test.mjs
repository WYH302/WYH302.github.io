import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { postSlugs } from "../scripts/bilingual-routes.mjs";
import { postPublicationTimes } from "../scripts/post-publication-times.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const expectedPublicationTimes = {
  "three-pillars-programming-ai-economics": "2026-07-23T00:42:01+08:00",
  "language-gravity-ai-bias-compression": "2026-07-22T01:11:25+08:00",
  "language-as-lossy-compression": "2026-07-22T00:45:34+08:00",
  "multimodal-agents-computational-imaging": "2026-06-19T00:56:27+08:00",
  "leakage-controlled-evaluation": "2026-07-04T09:42:11+08:00",
  "two-high-one-low-social-expectations": "2026-07-05T22:25:57+08:00",
  "verifiable-multimodal-engineering": "2026-07-04T09:42:11+08:00",
  "civil-service-security-and-ambition": "2026-07-24T15:19:29+08:00",
  "population-property-policy-feedback": "2026-07-26T22:40:33+08:00",
  "grammar-expression-information-structure": "2026-07-26T23:16:41+08:00",
  "tailwinds-headwinds-path-dependence-2026": "2026-07-28T12:06:13+08:00",
  "youth-defensive-withdrawal-and-social-trust": "2026-09-06T16:15:00+08:00",
  "ai-audits-power-algorithmic-governance": "2026-09-06T16:15:00+08:00",
  "tenure-review-youth-and-university-renewal": "2026-09-06T16:15:00+08:00",
};

function occurrences(text, value) {
  return text.split(value).length - 1;
}

function cardForSlug(html, slug) {
  return html
    .split('<article class="note-card">')
    .find((card) => card.includes(`../posts/${slug}/`));
}

test("publication metadata matches each post's first Git publication", () => {
  assert.deepEqual(postPublicationTimes, expectedPublicationTimes);
  assert.deepEqual(Object.keys(postPublicationTimes), postSlugs);
});

test("every bilingual article exposes one visible and one machine-readable publication time", () => {
  for (const slug of postSlugs) {
    const publishedAt = postPublicationTimes[slug];
    const englishPost = fs.readFileSync(path.join(root, `posts/${slug}/index.html`), "utf8");
    const chinesePost = fs.readFileSync(path.join(root, `zh/posts/${slug}/index.html`), "utf8");

    for (const html of [englishPost, chinesePost]) {
      assert.equal(
        occurrences(
          html,
          `<meta property="article:published_time" content="${publishedAt}">`,
        ),
        1,
        `${slug} should expose one Open Graph publication time`,
      );
      assert.equal(
        occurrences(html, `<time datetime="${publishedAt}">`),
        1,
        `${slug} should expose one visible semantic publication time`,
      );
    }

    assert.match(englishPost, /class="article-meta"[^>]*>[^<]*Published /);
    assert.match(chinesePost, /class="article-meta"[^>]*>[^<]*发布于 /);
  }
});

test("both blog indexes show every post's publication time once", () => {
  const englishBlog = fs.readFileSync(path.join(root, "blog/index.html"), "utf8");
  const chineseBlog = fs.readFileSync(path.join(root, "zh/blog/index.html"), "utf8");

  for (const [slug, publishedAt] of Object.entries(postPublicationTimes)) {
    const englishCard = cardForSlug(englishBlog, slug);
    const chineseCard = cardForSlug(chineseBlog, slug);

    assert.ok(englishCard, `missing English blog card for ${slug}`);
    assert.ok(chineseCard, `missing Chinese blog card for ${slug}`);
    assert.equal(occurrences(englishCard, `<time datetime="${publishedAt}">`), 1);
    assert.equal(occurrences(chineseCard, `<time datetime="${publishedAt}">`), 1);
  }

  assert.equal(occurrences(englishBlog, " · Published "), postSlugs.length);
  assert.equal(occurrences(chineseBlog, " · 发布于 "), postSlugs.length);
});

test("both blog indexes are ordered from newest to oldest publication time", () => {
  const blogFiles = ["blog/index.html", "zh/blog/index.html"];

  for (const blogFile of blogFiles) {
    const html = fs.readFileSync(path.join(root, blogFile), "utf8");
    const publicationTimes = [
      ...html.matchAll(/class="item-meta"[^>]*>.*?<time datetime="([^"]+)">/g),
    ].map((match) => match[1]);
    const sortedTimes = [...publicationTimes].sort(
      (left, right) => Date.parse(right) - Date.parse(left),
    );

    assert.deepEqual(publicationTimes, sortedTimes, `${blogFile} is not newest-first`);
  }
});
