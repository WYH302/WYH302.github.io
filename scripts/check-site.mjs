import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "_site");
const ignoredDirectories = new Set([
  ".git",
  "node_modules",
  "_site",
  "dist",
  "coverage",
  "playwright-report",
  "test-results",
]);

const requiredSourceFiles = [
  "index.html",
  "projects/index.html",
  "publications/index.html",
  "blog/index.html",
  "posts/multimodal-agents-computational-imaging/index.html",
  "checklist/index.html",
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
  "README.md",
  "SECURITY.md",
];

const requiredPublishedFiles = requiredSourceFiles.filter(
  (file) => !["README.md", "SECURITY.md"].includes(file),
);

function walk(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    if (ignoredDirectories.has(entry.name)) {
      return [];
    }

    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return walk(fullPath);
    }

    return [fullPath];
  });
}

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function localTargetExists(sourceFile, href) {
  const cleanHref = href.split("#")[0].split("?")[0];
  if (!cleanHref) {
    return true;
  }

  if (/^(https?:|mailto:|tel:)/i.test(cleanHref)) {
    return true;
  }

  const sourceDirectory = path.dirname(sourceFile);
  const resolved = path.resolve(sourceDirectory, decodeURIComponent(cleanHref));

  if (!resolved.startsWith(root)) {
    return false;
  }

  if (fs.existsSync(resolved)) {
    const stat = fs.statSync(resolved);
    return stat.isDirectory() ? fs.existsSync(path.join(resolved, "index.html")) : true;
  }

  if (!path.extname(resolved)) {
    return fs.existsSync(path.join(resolved, "index.html"));
  }

  return false;
}

function relative(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, "/");
}

const htmlFiles = walk(root).filter((filePath) => filePath.endsWith(".html"));
const allFiles = walk(root);
const failures = [];
const warnings = [];
let placeholderCount = 0;

for (const filePath of htmlFiles) {
  const html = read(filePath);
  const file = relative(filePath);

  if (!/<main[\s>]/.test(html)) {
    failures.push(`${file}: missing <main> landmark`);
  }

  if (!/class="skip-link"/.test(html)) {
    failures.push(`${file}: missing skip link`);
  }

  if (!/<title>[^<]+<\/title>/.test(html)) {
    failures.push(`${file}: missing document title`);
  }

  const links = [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  for (const href of links) {
    if (!localTargetExists(filePath, href)) {
      failures.push(`${file}: broken local link -> ${href}`);
    }
  }

  const images = [...html.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);
  for (const image of images) {
    if (!/\salt="[^"]*"/.test(image)) {
      failures.push(`${file}: image missing alt text -> ${image}`);
    }
  }

  const placeholders = html.match(/\[[A-Za-z][^\]]+\]|yourusername|your_email@university\.edu/g);
  placeholderCount += placeholders ? placeholders.length : 0;
}

for (const file of requiredSourceFiles) {
  if (!allFiles.some((filePath) => relative(filePath) === file)) {
    failures.push(`missing required file: ${file}`);
  }
}

if (fs.existsSync(outputDirectory)) {
  for (const file of requiredPublishedFiles) {
    if (!fs.existsSync(path.join(outputDirectory, file))) {
      failures.push(`missing published file in _site: ${file}`);
    }
  }
}

if (placeholderCount > 0) {
  warnings.push(`placeholder tokens remain: ${placeholderCount}`);
}

if (warnings.length > 0) {
  console.warn("Warnings:");
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}

if (failures.length > 0) {
  console.error("Site check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Site check passed for ${htmlFiles.length} HTML files.`);
