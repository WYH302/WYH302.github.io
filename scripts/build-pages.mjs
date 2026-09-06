import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { injectLanguageMarkup } from "./bilingual-markup.mjs";
import { applyEditorialLayout } from "./editorial-layout.mjs";
import { bilingualRoutePairs } from "./bilingual-routes.mjs";
import { publishEntries } from "./publish-manifest.mjs";
import {
  assertSafePublishSource,
  assetExtensions,
  htmlExtensions,
  localOnlySourcePaths,
  validateCname,
} from "./publish-safety.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "_site");

function injectLanguageNavigation(route, pair, language) {
  const filePath = path.join(outputDirectory, route);
  const html = injectLanguageMarkup(fs.readFileSync(filePath, "utf8"), route, pair, language)
    .replaceAll("styles.css?v=20260703-site", "styles.css?v=20260722-bilingual")
    .replaceAll("styles.css?v=20260618-visual", "styles.css?v=20260722-bilingual");
  fs.writeFileSync(filePath, applyEditorialLayout(html, route), "utf8");
}

function copyEntry(entry) {
  const source = path.join(root, entry);
  const target = path.join(outputDirectory, entry);

  if (!fs.existsSync(source)) {
    throw new Error(`Missing publish entry: ${entry}`);
  }

  assertSafePublishSource(source, root);
  const sourceIsDirectory = fs.lstatSync(source).isDirectory();
  const allowedExtensions = entry === "assets"
    ? assetExtensions
    : sourceIsDirectory
      ? htmlExtensions
      : null;

  fs.cpSync(source, target, {
    recursive: true,
    force: true,
    filter: (sourcePath) => {
      const relativeSource = path.relative(root, sourcePath).replaceAll(path.sep, "/");
      if (localOnlySourcePaths.has(relativeSource)) return false;
      if (sourcePath.includes(`${path.sep}.git${path.sep}`)) {
        return false;
      }
      assertSafePublishSource(sourcePath, root, allowedExtensions);
      return true;
    },
  });
}

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });

for (const entry of publishEntries) {
  copyEntry(entry);
}

const cnamePath = path.join(root, "CNAME");
if (fs.existsSync(cnamePath)) {
  assertSafePublishSource(cnamePath, root);
  validateCname(fs.readFileSync(cnamePath, "utf8"));
  fs.copyFileSync(cnamePath, path.join(outputDirectory, "CNAME"));
}

for (const pair of bilingualRoutePairs) {
  injectLanguageNavigation(pair.en, pair, "en");
  injectLanguageNavigation(pair.zh, pair, "zh-CN");
}

console.log(`Built static site in ${outputDirectory}`);
