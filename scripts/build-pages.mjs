import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "_site");

const publishEntries = [
  ".nojekyll",
  "404.html",
  "index.html",
  "assets",
  "blog",
  "checklist",
  "contact",
  "cv",
  "projects",
  "publications",
];

function copyEntry(entry) {
  const source = path.join(root, entry);
  const target = path.join(outputDirectory, entry);

  if (!fs.existsSync(source)) {
    throw new Error(`Missing publish entry: ${entry}`);
  }

  fs.cpSync(source, target, {
    recursive: true,
    force: true,
    filter: (sourcePath) => !sourcePath.includes(`${path.sep}.git${path.sep}`),
  });
}

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });

for (const entry of publishEntries) {
  copyEntry(entry);
}

const cnamePath = path.join(root, "CNAME");
if (fs.existsSync(cnamePath)) {
  fs.copyFileSync(cnamePath, path.join(outputDirectory, "CNAME"));
}

console.log(`Built static site in ${outputDirectory}`);
