#!/usr/bin/env node

import ginny from ".";
import { watch } from "chokidar";
import { create } from "./context";
import { markChanged } from "./dependencies";
import { setupServer } from "./server";

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
    const entries = markChanged(file, context);

    if (file.startsWith(context.srcDir) && !entries.includes(file)) {
      entries.push(file);
    }

    scheduleRun(entries);
  });

  watcher.on("change", (file) => scheduleRun(markChanged(file, context)));
  watcher.on("unlink", (file) => scheduleRun(markChanged(file, context)));

  scheduleRun(process.argv.length > 2 ? process.argv.slice(2) : undefined);
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
