import { Context } from "./context";
import * as http from "http";
import { extname, join } from "path";
import { readFile } from "fs/promises";
import { createHash } from "crypto";

const contentTypes: Record<string, string> = {
  ".png": "image/png",
  ".js": "text/javascript",
  ".html": "text/html",
  ".css": "text/css",
  ".json": "application/json",
  ".jpg": "image/jpg",
  ".jpeg": "image/jpg",
  ".svg": "image/svg+xml"
};

async function handleRequest(
  request: http.IncomingMessage,
  response: http.ServerResponse,
  context: Context
): Promise<void> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, "method not allowed");
    response.end();
    return;
  }
  const tryFiles = request.url ? [request.url] : [];

  if (!request.url || !extname(request.url)) {
    tryFiles.push(`${request.url ?? "."}/index.html`);
  }

  for (const tryFile of tryFiles) {
    const contentType = contentTypes[extname(tryFile)] ?? "application/octet-stream";

    try {
      const content = await readFile(join(context.outDir, tryFile));
      const etag = createHash("md5").update(content).digest("hex");

      let responseCode = 200;

      if (request.headers["if-none-match"] === etag) {
        responseCode = 302;
      }

      response.writeHead(responseCode, { "Content-Type": contentType, "ETag": etag });
      response.end(request.method === "GET" ? content : undefined);
      return;
    } catch {
      // Ignore, try next file
    }
  }

  response.writeHead(404, "File not found");
  response.end();
}

export function setupServer(context: Context): void {
  http.createServer((request, response) => handleRequest(request, response, context)).listen(3003);

  console.log("Listening on http://localhost:3003");
}
