import fs from "node:fs";
import path from "node:path";

export const assetExtensions = new Set([
  ".avif",
  ".css",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".webp",
]);

export const htmlExtensions = new Set([".html"]);

const forbiddenPublishExtensions = new Set([
  ".db",
  ".doc",
  ".docx",
  ".key",
  ".p12",
  ".pdf",
  ".pem",
  ".pfx",
  ".sqlite",
  ".tex",
  ".zip",
]);

export function assertSafePublishSource(sourcePath, repositoryRoot, allowedExtensions = null) {
  const stats = fs.lstatSync(sourcePath);
  const relativePath = path.relative(repositoryRoot, sourcePath);
  if (stats.isSymbolicLink()) {
    throw new Error(`Refusing to publish symbolic link: ${relativePath}`);
  }
  if (stats.isDirectory()) {
    return;
  }

  const fileName = path.basename(sourcePath).toLowerCase();
  const extension = path.extname(fileName);
  if (
    fileName === ".env" ||
    fileName.startsWith(".env.") ||
    forbiddenPublishExtensions.has(extension)
  ) {
    throw new Error(`Refusing to publish sensitive file type: ${relativePath}`);
  }
  if (allowedExtensions && !allowedExtensions.has(extension)) {
    throw new Error(`Refusing unexpected publish file type: ${relativePath}`);
  }
}

export function validateCname(content) {
  const hostname = content.endsWith("\r\n")
    ? content.slice(0, -2)
    : content.endsWith("\n")
      ? content.slice(0, -1)
      : content;
  const hostnamePattern = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
  if (hostname !== hostname.trim() || /[\r\n]/.test(hostname) || !hostnamePattern.test(hostname)) {
    throw new Error("CNAME must contain one valid hostname without surrounding whitespace");
  }
  return hostname;
}
