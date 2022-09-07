#!/usr/bin/env node

import ginny from ".";
import { watch } from "chokidar";
import { Context, create } from "./context";
import { markChanged } from "./dependencies";
import * as http from "http";
import { extname, join } from "path";
import { readFile } from "fs/promises";

async function run(): Promise<void> {
  const watchArgIndex = process.argv.indexOf("--watch");

  if (watchArgIndex !== -1) {
    process.argv.splice(watchArgIndex, 1);
    await runWatch();
    return;
  }

  const dependencyGraphIndex = process.argv.indexOf("--dependency-graph");

  if (dependencyGraphIndex !== -1) {
    process.argv.splice(watchArgIndex, 1);
    await runDependencyGraph();
    return;
  }

  await runBuild();
}

async function runWatch(): Promise<void> {
  console.log("Starting ginny in watch mode...\n");

  const context = await create({ isWatch: true });
  setupServer(context);

  const watcher = watch(process.cwd(), { ignoreInitial: true, ignored: ["node_modules", ".git", context.outDir] });

  watcher.on("add", (file) => {
    const entries = markChanged(file);

    if (file.startsWith(context.srcDir) && !entries.includes(file)) {
      entries.push(file);
    }

    scheduleRun(entries);
  });

  watcher.on("change", (file) => scheduleRun(markChanged(file)));
  watcher.on("unlink", (file) => scheduleRun(markChanged(file)));

  scheduleRun(process.argv.length > 2 ? process.argv.slice(2) : undefined);
}

const contentTypes: Record<string, string> = {
  ".png": "image/png",
  ".js": "text/javascript",
  ".html": "text/html",
  ".css": "text/css",
  ".json": "application/json",
  ".jpg": "image/jpg",
  ".jpeg": "image/jpg"
};

function setupServer(context: Context): void {
  http
    .createServer(async (request, response) => {
      const tryFiles = request.url ? [request.url] : [];

      if (!request.url || !extname(request.url)) {
        tryFiles.push(`${request.url ?? "."}/index.html`);
      }

      for (const tryFile of tryFiles) {
        const contentType = contentTypes[extname(tryFile)] ?? "application/octet-stream";

        try {
          const content = await readFile(join(context.outDir, tryFile));

          response.writeHead(200, { "Content-Type": contentType });
          response.end(content);
          return;
        } catch {
          // Ignore, try next file
        }
      }

      response.writeHead(404, "File not found");
      response.end();
    })
    .listen(3003);

  console.log("Listening on http://localhost:3003");
}

let running = new Promise<void>((resolve) => resolve());

function scheduleRun(files: string[] | undefined): void {
  if (files?.length === 0) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  running = running.then(() => ginny({ files, watch: true }).catch(() => {}));
}

async function runDependencyGraph(): Promise<void> {
  return ginny({
    files: process.argv.length > 2 ? process.argv.slice(2) : undefined,
    dependencyGraph: true
  });
}

async function runBuild(): Promise<void> {
  return ginny({
    files: process.argv.length > 2 ? process.argv.slice(2) : undefined
  });
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
