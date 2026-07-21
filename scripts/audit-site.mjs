import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = path.join(root, "_site");

const requiredRoutes = [
  "index.html",
  "projects/index.html",
  "publications/index.html",
  "blog/index.html",
  "posts/language-gravity-ai-bias-compression/index.html",
  "posts/multimodal-agents-computational-imaging/index.html",
  "posts/language-as-lossy-compression/index.html",
  "posts/leakage-controlled-evaluation/index.html",
  "posts/two-high-one-low-social-expectations/index.html",
  "posts/verifiable-multimodal-engineering/index.html",
  "cv/index.html",
  "contact/index.html",
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

const publicHtmlRoutes = [
  "index.html",
  "projects/index.html",
  "publications/index.html",
  "blog/index.html",
  "posts/language-gravity-ai-bias-compression/index.html",
  "posts/multimodal-agents-computational-imaging/index.html",
  "posts/language-as-lossy-compression/index.html",
  "posts/leakage-controlled-evaluation/index.html",
  "posts/two-high-one-low-social-expectations/index.html",
  "posts/verifiable-multimodal-engineering/index.html",
  "cv/index.html",
  "contact/index.html",
];

const forbiddenPublishedPaths = [
  "posts/reading-note-template/index.html",
  "assets/images/profile-placeholder.svg",
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

for (const route of publicHtmlRoutes) {
  const filePath = path.join(site, route);
  if (!fs.existsSync(filePath)) {
    continue;
  }

  const html = read(filePath);
  if (!/<link rel="canonical" href="https:\/\/wyh302\.github\.io\//.test(html)) {
    failures.push(`${route}: missing canonical URL`);
  }
  if (/<meta name="robots" content="noindex"/.test(html)) {
    failures.push(`${route}: public page is marked noindex`);
  }
  if (!/<meta property="og:title"/.test(html)) {
    failures.push(`${route}: missing Open Graph title`);
  }
}

const blogHtml = read(path.join(site, "blog/index.html"));
if (!/posts\/language-gravity-ai-bias-compression\//.test(blogHtml)) {
  failures.push("blog/index.html: missing link to the language gravity essay");
}
if (!/posts\/multimodal-agents-computational-imaging\//.test(blogHtml)) {
  failures.push("blog/index.html: missing link to the published research note");
}
if (!/posts\/language-as-lossy-compression\//.test(blogHtml)) {
  failures.push("blog/index.html: missing link to the language compression essay");
}
if (!/posts\/leakage-controlled-evaluation\//.test(blogHtml)) {
  failures.push("blog/index.html: missing link to the leakage-controlled evaluation note");
}
if (!/posts\/two-high-one-low-social-expectations\//.test(blogHtml)) {
  failures.push("blog/index.html: missing link to the two-high-one-low social essay");
}
if (!/posts\/verifiable-multimodal-engineering\//.test(blogHtml)) {
  failures.push("blog/index.html: missing link to the verifiable multimodal engineering note");
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

if (failures.length > 0) {
  console.error("Acceptance audit failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Acceptance audit passed.");
