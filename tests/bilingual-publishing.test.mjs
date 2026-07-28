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

test("the policy-feedback essay is published as a sourced bilingual post", () => {
  const slug = "population-property-policy-feedback";
  const citedSources = [
    "https://www.stats.gov.cn/xxgk/sjfb/tjgb2020/202602/t20260228_1962662.html",
    "https://population.un.org/wpp/assets/Files/WPP2024_Summary-of-Results.pdf",
    "https://plato.stanford.edu/archives/spr2026/entries/laozi/",
  ];
  const englishPost = fs.readFileSync(path.join(root, `posts/${slug}/index.html`), "utf8");
  const chinesePost = fs.readFileSync(path.join(root, `zh/posts/${slug}/index.html`), "utf8");
  const englishBlog = fs.readFileSync(path.join(root, "blog/index.html"), "utf8");
  const chineseBlog = fs.readFileSync(path.join(root, "zh/blog/index.html"), "utf8");

  assert.ok(postSlugs.includes(slug), "new essay should be in the bilingual route table");
  assert.match(englishPost, /From expansion to adjustment/);
  assert.match(chinesePost, /从增量扩张到存量调整/);
  assert.match(englishPost, /not a single-cause explanation/i);
  assert.match(chinesePost, /不是单一原因的解释/);
  assert.match(englishPost, /National Bureau of Statistics of China/);
  assert.match(chinesePost, /国家统计局/);
  assert.ok(publishEntries.includes(`posts/${slug}`));
  for (const source of citedSources) {
    assert.equal(occurrences(englishPost, source), 1);
    assert.equal(occurrences(chinesePost, source), 1);
  }
  assert.equal(occurrences(englishBlog, `../posts/${slug}/`), 1);
  assert.equal(occurrences(chineseBlog, `../posts/${slug}/`), 1);
});

test("the grammar-and-expression essay is published as a sourced bilingual post", () => {
  const slug = "grammar-expression-information-structure";
  const citedSources = [
    "https://wals.info/chapter/81",
    "https://benjamins.com/catalog/sl.33.1.04son",
  ];
  const englishPost = fs.readFileSync(path.join(root, `posts/${slug}/index.html`), "utf8");
  const chinesePost = fs.readFileSync(path.join(root, `zh/posts/${slug}/index.html`), "utf8");
  const englishBlog = fs.readFileSync(path.join(root, "blog/index.html"), "utf8");
  const chineseBlog = fs.readFileSync(path.join(root, "zh/blog/index.html"), "utf8");

  assert.ok(postSlugs.includes(slug), "new essay should be in the bilingual route table");
  assert.match(englishPost, /Are grammar and expression truly isomorphic/i);
  assert.match(chinesePost, /语法与表达真的“完全同构”吗/);
  assert.match(englishPost, /local alignment without total isomorphism/i);
  assert.match(chinesePost, /局部同向，整体并不同构/);
  assert.ok(publishEntries.includes(`posts/${slug}`));
  for (const source of citedSources) {
    assert.equal(occurrences(englishPost, source), 1);
    assert.equal(occurrences(chinesePost, source), 1);
  }
  assert.equal(occurrences(englishBlog, `../posts/${slug}/`), 1);
  assert.equal(occurrences(chineseBlog, `../posts/${slug}/`), 1);
});

test("the tailwinds and headwinds essay is published as a sourced bilingual post", () => {
  const slug = "tailwinds-headwinds-path-dependence-2026";
  const citedSources = [
    "https://www.nobelprize.org/prizes/economic-sciences/1993/north/lecture/",
    "https://ctext.org/han-shu/shi-huo-zhi-shang/zhs",
    "https://www.oecd.org/en/publications/systemic-thinking-for-policy-making_879c4f7a-en/full-report.html",
    "https://ir.pku.edu.cn/handle/20.500.11897/479251?mode=full",
    "https://www.spp.gov.cn/spp/llyj/202009/t20200910_479422.shtml",
    "https://www.imf.org/en/publications/weo/issues/2026/07/08/world-economic-outlook-update-july-2026",
    "https://www.worldbank.org/en/news/press-release/2026/04/08/energy-shock-and-uncertainty-slow-growth-in-east-asia-and-pacific",
    "https://economy-finance.ec.europa.eu/economic-surveillance-eu-member-states/country-pages-including-country-reports/germany/economic-forecast-germany_en",
    "https://www.oecd.org/content/dam/oecd/en/publications/reports/2026/07/oecd-economic-surveys-korea-2026_17d6bf02/6b87f585-en.pdf",
    "https://fiscal.treasury.gov/accounting/us-financial-report/results-in-brief",
  ];
  const englishPost = fs.readFileSync(path.join(root, `posts/${slug}/index.html`), "utf8");
  const chinesePost = fs.readFileSync(path.join(root, `zh/posts/${slug}/index.html`), "utf8");
  const englishBlog = fs.readFileSync(path.join(root, "blog/index.html"), "utf8");
  const chineseBlog = fs.readFileSync(path.join(root, "zh/blog/index.html"), "utf8");

  assert.ok(postSlugs.includes(slug), "new essay should be in the bilingual route table");
  assert.match(englishPost, /Tailwinds, headwinds, and institutional room to move/i);
  assert.match(chinesePost, /顺风局、逆风局与制度的回旋余地/);
  assert.match(englishPost, /analytical shorthand, not a formal law/i);
  assert.match(chinesePost, /分析性简称，不是一条形式化定律/);
  assert.match(englishPost, /thermodynamic entropy/i);
  assert.match(chinesePost, /热力学熵/);
  assert.match(englishPost, /4\.1% growth for the ASEAN-5 in 2026/);
  assert.match(englishPost, /India at 6\.4% on a fiscal-year basis/);
  assert.match(englishPost, /7\.0%[\s\S]*calendar year 2026/);
  assert.match(chinesePost, /东盟五国 2026 年增长 4\.1%/);
  assert.match(chinesePost, /按财政年度列示印度增长 6\.4%/);
  assert.match(chinesePost, /自然年 2026 增速则是 7\.0%/);
  assert.doesNotMatch(englishPost, /4\.3% for the ASEAN-5 in 2026/);
  assert.doesNotMatch(chinesePost, /东盟五国(?:增长| 2026 年增长) 4\.3%/);
  assert.ok(publishEntries.includes(`posts/${slug}`));
  for (const source of citedSources) {
    assert.equal(occurrences(englishPost, source), 1);
    assert.equal(occurrences(chinesePost, source), 1);
  }
  assert.equal(occurrences(englishBlog, `../posts/${slug}/`), 1);
  assert.equal(occurrences(chineseBlog, `../posts/${slug}/`), 1);
});
