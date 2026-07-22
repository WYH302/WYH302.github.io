import { publicUrl, relativeRouteHref } from "./bilingual-routes.mjs";

export function injectLanguageMarkup(html, route, pair, language) {
  const isEnglish = language === "en";
  const enHref = relativeRouteHref(route, pair.en);
  const zhHref = relativeRouteHref(route, pair.zh);
  const alternates = [
    `    <link rel="alternate" hreflang="en" href="${publicUrl(pair.en)}">`,
    `    <link rel="alternate" hreflang="zh-CN" href="${publicUrl(pair.zh)}">`,
    `    <link rel="alternate" hreflang="x-default" href="${publicUrl(pair.en)}">`,
  ].join("\n");
  const switcher = [
    "            <li class=\"language-switcher\">",
    `              <span class="visually-hidden">${isEnglish ? "Language" : "语言"}: </span>`,
    `              <a class="language-option"${isEnglish ? ' aria-current="page"' : ""} href="${enHref}" lang="en" hreflang="en">EN</a>`,
    "              <span aria-hidden=\"true\">/</span>",
    `              <a class="language-option"${isEnglish ? "" : ' aria-current="page"'} href="${zhHref}" lang="zh-CN" hreflang="zh-CN">中文</a>`,
    "            </li>",
  ].join("\n");

  const headClosingPattern = /<\/head>/i;
  if (!headClosingPattern.test(html)) {
    throw new Error(`Cannot inject language metadata: ${route}`);
  }

  const navigationListPattern = /(<ul\b[^>]*\bclass\s*=\s*(["'])[^"']*\bnav-list\b[^"']*\2[^>]*>)([\s\S]*?)(<\/ul>)/i;
  if (!navigationListPattern.test(html)) {
    throw new Error(`Cannot inject language switcher: ${route}`);
  }

  return html
    .replace(headClosingPattern, (closingTag) => `${alternates}\n${closingTag}`)
    .replace(
      navigationListPattern,
      (_match, openingTag, _quote, content, closingTag) =>
        `${openingTag}${content}\n${switcher}\n          ${closingTag}`,
    );
}
