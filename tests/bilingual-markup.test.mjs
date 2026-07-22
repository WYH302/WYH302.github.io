import assert from "node:assert/strict";
import test from "node:test";
import { injectLanguageMarkup } from "../scripts/bilingual-markup.mjs";

const pair = {
  en: "posts/example/index.html",
  zh: "zh/posts/example/index.html",
};

test("injects exact English metadata and switcher into compact markup", () => {
  const html = "<html><head><title>Example</title></head><body><ul class='menu nav-list'><li>Item</li></ul></body></html>";
  const result = injectLanguageMarkup(html, pair.en, pair, "en");

  assert.match(result, /hreflang="en" href="https:\/\/wyh302\.github\.io\/posts\/example\/"/);
  assert.match(result, /hreflang="zh-CN" href="https:\/\/wyh302\.github\.io\/zh\/posts\/example\/"/);
  assert.match(result, /hreflang="x-default" href="https:\/\/wyh302\.github\.io\/posts\/example\/"/);
  assert.match(result, /aria-current="page" href="\.\/" lang="en"/);
  assert.match(result, /href="\.\.\/\.\.\/zh\/posts\/example\/" lang="zh-CN"/);
  assert.equal((result.match(/class="language-switcher"/g) ?? []).length, 1);
});

test("marks Chinese as current and accepts expanded double-quoted navigation", () => {
  const html = `<!doctype html>
<html>
  <head>
    <title>示例</title>
  </head>
  <body>
    <ul class="nav-list">
      <li>项目</li>
    </ul>
  </body>
</html>`;
  const result = injectLanguageMarkup(html, pair.zh, pair, "zh-CN");

  assert.match(result, /<span class="visually-hidden">语言: <\/span>/);
  assert.match(result, /href="\.\.\/\.\.\/\.\.\/posts\/example\/" lang="en"/);
  assert.match(result, /aria-current="page" href="\.\/" lang="zh-CN"/);
});

test("rejects pages without a head closing tag", () => {
  assert.throws(
    () => injectLanguageMarkup("<ul class=\"nav-list\"></ul>", pair.en, pair, "en"),
    /Cannot inject language metadata/,
  );
});

test("rejects pages without the primary navigation list", () => {
  assert.throws(
    () => injectLanguageMarkup("<head></head><ul class=\"other\"></ul>", pair.en, pair, "en"),
    /Cannot inject language switcher/,
  );
});
