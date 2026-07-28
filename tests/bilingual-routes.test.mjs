import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  bilingualAllRoutes,
  bilingualPublicRoutes,
  bilingualRoutePairs,
  postSlugs,
  publicUrl,
  relativeRouteHref,
} from "../scripts/bilingual-routes.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("every route has one unique English and Chinese partner", () => {
  assert.equal(bilingualRoutePairs.length, 18);
  assert.equal(new Set(bilingualAllRoutes).size, bilingualAllRoutes.length);

  for (const pair of bilingualRoutePairs) {
    assert.equal(pair.zh, `zh/${pair.en}`);
  }
});

test("all eleven posts are public in both languages", () => {
  assert.equal(postSlugs.length, 11);
  assert.equal(postSlugs[0], "three-pillars-programming-ai-economics");

  for (const slug of postSlugs) {
    assert.ok(bilingualPublicRoutes.includes(`posts/${slug}/index.html`));
    assert.ok(bilingualPublicRoutes.includes(`zh/posts/${slug}/index.html`));
  }
});

test("language switch paths stay on the paired page", () => {
  assert.equal(relativeRouteHref("index.html", "zh/index.html"), "zh/");
  assert.equal(relativeRouteHref("zh/index.html", "index.html"), "../");
  assert.equal(
    relativeRouteHref(
      "posts/leakage-controlled-evaluation/index.html",
      "zh/posts/leakage-controlled-evaluation/index.html",
    ),
    "../../zh/posts/leakage-controlled-evaluation/",
  );
  assert.equal(
    relativeRouteHref(
      "zh/posts/leakage-controlled-evaluation/index.html",
      "posts/leakage-controlled-evaluation/index.html",
    ),
    "../../../posts/leakage-controlled-evaluation/",
  );
});

test("public URLs and source files match the route table", () => {
  assert.equal(publicUrl("index.html"), "https://wyh302.github.io/");
  assert.equal(
    publicUrl("zh/blog/index.html"),
    "https://wyh302.github.io/zh/blog/",
  );

  for (const route of bilingualAllRoutes) {
    assert.ok(fs.existsSync(path.join(root, route)), `missing source route: ${route}`);
  }
});
