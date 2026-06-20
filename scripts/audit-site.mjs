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
  "posts/multimodal-agents-computational-imaging/index.html",
  "cv/index.html",
  "contact/index.html",
  "robots.txt",
  "sitemap.xml",
  "site.webmanifest",
  "assets/css/styles.css",
  "assets/images/research-hero.png",
  "assets/images/research-systems.png",
  "assets/images/favicon.svg",
  "assets/files/cv.pdf",
];

const publicHtmlRoutes = [
  "index.html",
  "projects/index.html",
  "publications/index.html",
  "blog/index.html",
  "posts/multimodal-agents-computational-imaging/index.html",
  "cv/index.html",
  "contact/index.html",
];

const forbiddenPublishedPaths = [
  "posts/reading-note-template/index.html",
  "assets/images/profile-placeholder.svg",
];

const sensitivePatterns = [
  /Academic Homepage Draft/i,
  /13580662074/,
  /2001\.07/,
  /\bRMB\b/i,
  /\bmAP\b/i,
  /Under Review/i,
  /\bCN\d{6,}[A-Z]\b/,
  /Guangzhou Road Major/i,
  /your_email@university\.edu/i,
  /yourusername/i,
  /\[Your[^\]]+\]/,
];

const failures = [];
const pdfTextCandidates = [
  process.env.PDFTOTEXT_PATH,
  "pdftotext.exe",
  "pdftotext",
  "D:\\texlive\\2026\\bin\\windows\\pdftotext.exe",
  "C:\\texlive\\2026\\bin\\windows\\pdftotext.exe",
].filter(Boolean);

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

function extractPdfText(pdfPath) {
  let lastError = "pdftotext.exe was not found";

  for (const command of pdfTextCandidates) {
    const result = spawnSync(command, [pdfPath, "-"], {
      encoding: "utf8",
    });

    if (result.status === 0) {
      return { ok: true, stdout: result.stdout, command };
    }

    lastError = result.error
      ? `${command}: ${result.error.message}`
      : `${command}: exit ${result.status}${result.stderr ? ` ${result.stderr.trim()}` : ""}`;
  }

  return { ok: false, lastError };
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
if (!/posts\/multimodal-agents-computational-imaging\//.test(blogHtml)) {
  failures.push("blog/index.html: missing link to the published research note");
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

const cvPdf = fs.statSync(path.join(site, "assets/files/cv.pdf"));
if (cvPdf.size < 20_000) {
  failures.push("assets/files/cv.pdf: PDF appears too small to be a real CV");
}

const pdfTextResult = extractPdfText(path.join(site, "assets/files/cv.pdf"));

if (!pdfTextResult.ok) {
  failures.push(
    "assets/files/cv.pdf: unable to extract PDF text. Install pdftotext.exe or set PDFTOTEXT_PATH. " +
      `Last error: ${pdfTextResult.lastError}`,
  );
} else {
  const pdfText = pdfTextResult.stdout;
  if (!/Yonghao Wu/.test(pdfText) || !/South China Normal University/.test(pdfText)) {
    failures.push("assets/files/cv.pdf: expected public CV identity text not found");
  }

  for (const pattern of sensitivePatterns) {
    if (pattern.test(pdfText)) {
      failures.push(`assets/files/cv.pdf: forbidden public text matched ${pattern}`);
    }
  }
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
