import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  bilingualAllRoutes,
  bilingualRoutePairs,
  bilingualPublicRoutes,
  postSlugs,
  publicUrl,
  relativeRouteHref,
} from "./bilingual-routes.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = path.join(root, "_site");

const requiredRoutes = [
  ...bilingualAllRoutes,
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "site.webmanifest",
  "assets/css/styles.css",
  "assets/images/research-hero.png",
  "assets/images/research-systems.png",
  "assets/images/profile-photo.jpg",
  "assets/images/lifephoto-1.png",
  "assets/images/lifephoto-2.png",
  "assets/images/favicon.svg",
];

const publicHtmlRoutes = bilingualPublicRoutes;

const forbiddenPublishedPaths = [
  "posts/reading-note-template/index.html",
  "assets/images/profile-placeholder.svg",
];

const sensitiveSourceDirectories = [
  "Masters_recommendletter",
  "Overseas_recommendletter",
  "Undergraduate_recommendletter",
  "backups",
];

const sensitivePatterns = [
  /Academic Homepage Draft/i,
  /\bRMB\b/i,
  /\bmAP\s*[:=]|\bmAP@[0-9]/i,
  /Under Review/i,
  /Guangzhou Road Major/i,
  /your_email@university\.edu/i,
  /yourusername/i,
  /\[Your[^\]]+\]/,
];

const failures = [];
function read(file) {
  return fs.readFileSync(file, "utf8");
}

function exists(relativePath) {
  return fs.existsSync(path.join(site, relativePath));
}

function escapeRegularExpression(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function walk(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return walk(fullPath);
    }
    return [fullPath];
  });
}

function runGit(args, label) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    failures.push(`${label} failed${detail ? `: ${detail}` : ""}`);
    return "";
  }

  return result.stdout.trim();
}

for (const route of requiredRoutes) {
  if (!exists(route)) {
    failures.push(`missing published route: ${route}`);
  }
}

for (const route of forbiddenPublishedPaths) {
  if (exists(route)) {
    failures.push(`forbidden published template/placeholder: ${route}`);
  }
}

const notFoundHtml = read(path.join(site, "404.html"));
if (!/<section lang="zh-CN"/.test(notFoundHtml)) {
  failures.push("404.html: missing Chinese error message");
}
if (!/href="\/"/.test(notFoundHtml) || !/href="\/zh\/"/.test(notFoundHtml)) {
  failures.push("404.html: missing root-safe English or Chinese homepage link");
}

for (const route of publicHtmlRoutes) {
  const filePath = path.join(site, route);
  if (!fs.existsSync(filePath)) {
    continue;
  }

  const html = read(filePath);
  if (!html.includes(`<link rel="canonical" href="${publicUrl(route)}">`)) {
    failures.push(`${route}: missing or incorrect canonical URL`);
  }
  if (/<meta name="robots" content="noindex"/.test(html)) {
    failures.push(`${route}: public page is marked noindex`);
  }
  if (!/<meta property="og:title"/.test(html)) {
    failures.push(`${route}: missing Open Graph title`);
  }
  if (!html.includes(`<meta property="og:url" content="${publicUrl(route)}">`)) {
    failures.push(`${route}: missing or incorrect Open Graph URL`);
  }
}

for (const route of bilingualAllRoutes) {
  const filePath = path.join(site, route);
  if (!fs.existsSync(filePath)) {
    continue;
  }

  const html = read(filePath);
  const expectedLanguage = route.startsWith("zh/") ? "zh-CN" : "en";
  const pair = bilingualRoutePairs.find((candidate) =>
    candidate.en === route || candidate.zh === route,
  );
  if (!html.includes(`<html lang="${expectedLanguage}">`)) {
    failures.push(`${route}: expected html language ${expectedLanguage}`);
  }
  if ((html.match(/class="language-switcher"/g) ?? []).length !== 1) {
    failures.push(`${route}: expected one language switcher`);
  }
  if (!html.includes(`<span class="visually-hidden">${expectedLanguage === "en" ? "Language" : "语言"}: </span>`)) {
    failures.push(`${route}: missing accessible language-switcher label`);
  }
  if (!pair) {
    failures.push(`${route}: missing bilingual route pair`);
    continue;
  }
  for (const [language, pairedRoute] of [["en", pair.en], ["zh-CN", pair.zh]]) {
    if (!html.includes(`<link rel="alternate" hreflang="${language}" href="${publicUrl(pairedRoute)}">`)) {
      failures.push(`${route}: missing ${language} alternate URL`);
    }
  }
  if (!html.includes(`<link rel="alternate" hreflang="x-default" href="${publicUrl(pair.en)}">`)) {
    failures.push(`${route}: missing x-default alternate URL`);
  }
  const currentRoute = expectedLanguage === "en" ? pair.en : pair.zh;
  const currentText = expectedLanguage === "en" ? "EN" : "中文";
  const currentHref = relativeRouteHref(route, currentRoute);
  if (!html.includes(`aria-current="page" href="${currentHref}" lang="${expectedLanguage}" hreflang="${expectedLanguage}">${currentText}</a>`)) {
    failures.push(`${route}: language switcher does not identify the current language`);
  }
  if (route.startsWith("zh/")) {
    const chineseNavigationTargets = [
      ["关于", "zh/index.html"],
      ["项目", "zh/projects/index.html"],
      ["论文", "zh/publications/index.html"],
      ["博客", "zh/blog/index.html"],
      ["简历", "zh/cv/index.html"],
      ["联系", "zh/contact/index.html"],
    ];
    for (const [label, targetRoute] of chineseNavigationTargets) {
      const chineseRootHref = relativeRouteHref(route, "zh/index.html");
      const targetSuffix = targetRoute.replace(/^zh\//, "").replace(/index\.html$/, "");
      const expectedHref = targetSuffix
        ? `${chineseRootHref === "./" ? "" : chineseRootHref}${targetSuffix}`
        : chineseRootHref;
      const href = escapeRegularExpression(expectedHref);
      if (!new RegExp(`<a\\b[^>]*href="${href}"[^>]*>${label}</a>`).test(html)) {
        failures.push(`${route}: Chinese navigation link ${label} leaves the Chinese site`);
      }
    }
  }
}

for (const blogRoute of ["blog/index.html", "zh/blog/index.html"]) {
  const blogHtml = read(path.join(site, blogRoute));
  for (const slug of postSlugs) {
    if (!new RegExp(`posts/${slug}/`).test(blogHtml)) {
      failures.push(`${blogRoute}: missing link to ${slug}`);
    }
  }
}

const sitemap = read(path.join(site, "sitemap.xml"));
for (const route of publicHtmlRoutes) {
  const urlPath = route === "index.html" ? "" : route.replace(/index\.html$/, "");
  if (!sitemap.includes(`https://wyh302.github.io/${urlPath}`)) {
    failures.push(`sitemap.xml: missing ${urlPath || "homepage"}`);
  }
}

const manifest = JSON.parse(read(path.join(site, "site.webmanifest")));
if (manifest.name !== "Yonghao Wu Academic Homepage") {
  failures.push("site.webmanifest: unexpected app name");
}

const publishedTextFiles = walk(site).filter((file) =>
  [".html", ".css", ".xml", ".txt", ".json", ".webmanifest"].includes(path.extname(file)),
);

for (const filePath of publishedTextFiles) {
  const text = read(filePath);
  const relativePath = path.relative(site, filePath).replaceAll(path.sep, "/");
  for (const pattern of sensitivePatterns) {
    if (pattern.test(text)) {
      failures.push(`${relativePath}: forbidden public text matched ${pattern}`);
    }
  }
}

runGit(["diff", "--check"], "git diff --check");
runGit(["diff", "--cached", "--check"], "git diff --cached --check");

const trackedOfficeDocs = runGit(["ls-files", "--", "*.doc", "*.docx"], "tracked Office document scan")
  .split(/\r?\n/)
  .filter(Boolean);
if (trackedOfficeDocs.length > 0) {
  failures.push(`raw Office resume/source documents are tracked: ${trackedOfficeDocs.join(", ")}`);
}

const unignoredOfficeDocs = runGit(
  ["ls-files", "--others", "--exclude-standard", "--", "*.doc", "*.docx"],
  "unignored Office document scan",
)
  .split(/\r?\n/)
  .filter(Boolean);
if (unignoredOfficeDocs.length > 0) {
  failures.push(`raw Office resume/source documents are not ignored: ${unignoredOfficeDocs.join(", ")}`);
}

const trackedSensitiveSources = runGit(
  ["ls-files", "--", ...sensitiveSourceDirectories],
  "tracked sensitive source scan",
)
  .split(/\r?\n/)
  .filter(Boolean);
if (trackedSensitiveSources.length > 0) {
  failures.push(`sensitive recommendation or backup sources are tracked: ${trackedSensitiveSources.join(", ")}`);
}

const unignoredSensitiveSources = runGit(
  ["ls-files", "--others", "--exclude-standard", "--", ...sensitiveSourceDirectories],
  "unignored sensitive source scan",
)
  .split(/\r?\n/)
  .filter(Boolean);
if (unignoredSensitiveSources.length > 0) {
  failures.push(`sensitive recommendation or backup sources are not ignored: ${unignoredSensitiveSources.join(", ")}`);
}

if (failures.length > 0) {
  console.error("Acceptance audit failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Acceptance audit passed.");
