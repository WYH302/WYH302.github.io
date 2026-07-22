import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "_site");
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

function isInside(directory, candidate) {
  const relativePath = path.relative(directory, candidate);
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}

export function resolveRequestPath(requestUrl, siteRoot = root, serverPort = port) {
  const url = new URL(requestUrl, `http://localhost:${serverPort}`);
  const decodedPath = decodeURIComponent(url.pathname);
  const cleanPath = decodedPath.replace(/^\/+/, "");
  const requestedPath = path.resolve(siteRoot, cleanPath || "index.html");

  if (!isInside(siteRoot, requestedPath)) {
    return null;
  }

  const filePath = fs.existsSync(requestedPath) && fs.statSync(requestedPath).isDirectory()
    ? path.join(requestedPath, "index.html")
    : requestedPath;

  if (!fs.existsSync(filePath)) {
    return filePath;
  }

  const realRoot = fs.realpathSync(siteRoot);
  const realFilePath = fs.realpathSync(filePath);
  return isInside(realRoot, realFilePath) ? realFilePath : null;
}

export function createRequestHandler(siteRoot = root, serverPort = port) {
  return (request, response) => {
    let filePath;
    try {
      filePath = resolveRequestPath(request.url || "/", siteRoot, serverPort);
    } catch (error) {
      if (error instanceof URIError) {
        response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
        response.end("Bad request");
        return;
      }
      throw error;
    }

    if (!filePath || !fs.existsSync(filePath)) {
      const fallback = path.join(siteRoot, "404.html");
      response.writeHead(404, { "content-type": "text/html; charset=utf-8" });
      response.end(fs.readFileSync(fallback));
      return;
    }

    const extension = path.extname(filePath);
    response.writeHead(200, {
      "content-type": contentTypes.get(extension) || "application/octet-stream",
    });
    response.end(fs.readFileSync(filePath));
  };
}

const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMainModule) {
  const server = http.createServer(createRequestHandler());
  server.listen(port, () => {
    console.log(`Serving ${root} at http://localhost:${port}`);
  });
}
