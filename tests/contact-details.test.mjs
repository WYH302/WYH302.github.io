import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pages = [
  ["English", fs.readFileSync(path.join(root, "contact/index.html"), "utf8")],
  ["Chinese", fs.readFileSync(path.join(root, "zh/contact/index.html"), "utf8")],
];
const publicContactPages = [
  "index.html",
  "cv/index.html",
  "contact/index.html",
  "zh/index.html",
  "zh/cv/index.html",
  "zh/contact/index.html",
];
const emailAddresses = [
  "2023025071@m.scnu.edu.cn",
  "carey.higdon51@gmail.com",
  "1772972738@qq.com",
];

function occurrences(text, value) {
  return text.split(value).length - 1;
}

test("both contact pages expose the three confirmed email addresses once", () => {
  for (const [language, html] of pages) {
    for (const address of emailAddresses) {
      assert.equal(
        occurrences(html, `href="mailto:${address}"`),
        1,
        `${language} contact page should link ${address} once`,
      );
    }
  }
});

test("both contact pages identify the QQ number without malformed addresses", () => {
  for (const [language, html] of pages) {
    assert.match(html, /<span class="contact-value">1772972738<\/span>/, `${language} QQ number`);
    assert.doesNotMatch(html, /mailto:2023025071@m\.scnu\.edu"/);
    assert.doesNotMatch(html, /gmailcom|scnu\.educn/);
  }
});

test("contact labels identify the preferred email and alternative providers", () => {
  const english = pages[0][1];
  const chinese = pages[1][1];

  assert.match(english, /Academic email \(preferred\)/);
  assert.match(english, /Gmail/);
  assert.match(english, /QQ email/);
  assert.match(chinese, /学术邮箱（首选）/);
  assert.match(chinese, /Gmail/);
  assert.match(chinese, /QQ 邮箱/);
});

test("every public contact entry uses the complete preferred academic address", () => {
  for (const route of publicContactPages) {
    const html = fs.readFileSync(path.join(root, route), "utf8");
    assert.match(
      html,
      /href="mailto:2023025071@m\.scnu\.edu\.cn"/,
      `${route} should use the complete academic address`,
    );
    assert.doesNotMatch(html, /href="mailto:2023025071@m\.scnu\.edu"/);
  }

  const siteConfig = fs.readFileSync(path.join(root, "_config.yml"), "utf8");
  assert.match(siteConfig, /email: "2023025071@m\.scnu\.edu\.cn"/);
  assert.doesNotMatch(siteConfig, /email: "2023025071@m\.scnu\.edu"/);
});

test("homepage structured data advertises the complete preferred email", () => {
  const homepage = fs.readFileSync(path.join(root, "index.html"), "utf8");

  assert.match(
    homepage,
    /"email": "mailto:2023025071@m\.scnu\.edu\.cn"/,
  );
  assert.doesNotMatch(
    homepage,
    /"email": "mailto:2023025071@m\.scnu\.edu"/,
  );
});
