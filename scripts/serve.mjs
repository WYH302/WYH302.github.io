import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 8080);

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".pdf", "application/pdf"],
  [".txt", "text/plain; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
]);

function resolveRequestPath(requestUrl) {
  const url = new URL(requestUrl, `http://localhost:${port}`);
  const decodedPath = decodeURIComponent(url.pathname);
  const cleanPath = decodedPath.replace(/^\/+/, "");
  const requestedPath = path.resolve(root, cleanPath || "index.html");

  if (!requestedPath.startsWith(root)) {
    return null;
  }

  if (fs.existsSync(requestedPath) && fs.statSync(requestedPath).isDirectory()) {
    return path.join(requestedPath, "index.html");
  }

  return requestedPath;
}

const server = http.createServer((request, response) => {
  const filePath = resolveRequestPath(request.url || "/");

  if (!filePath || !fs.existsSync(filePath)) {
    const fallback = path.join(root, "404.html");
    response.writeHead(404, { "content-type": "text/html; charset=utf-8" });
    response.end(fs.readFileSync(fallback));
    return;
  }

  const extension = path.extname(filePath);
  response.writeHead(200, {
    "content-type": contentTypes.get(extension) || "application/octet-stream",
  });
  response.end(fs.readFileSync(filePath));
});

server.listen(port, () => {
  console.log(`Serving ${root} at http://localhost:${port}`);
});
