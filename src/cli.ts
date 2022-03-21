#!/usr/bin/env node

import ginny from ".";
import { watch } from "chokidar";
import { create } from "./context";
import { getEntries } from "./dependencies";

async function run(): Promise<void> {
  const watchArgIndex = process.argv.indexOf("--watch");

  if (watchArgIndex !== -1) {
    process.argv.splice(watchArgIndex, 1);
    await runWatch();
  } else {
    await runBuild();
  }
}

async function runWatch(): Promise<void> {
  console.log("Starting ginny in watch mode...\n");

  const context = await create();
  const watcher = watch(process.cwd(), { ignoreInitial: true, ignored: ["node_modules", ".git", context.outDir] });

  watcher.on("add", (file) => {
    delete require.cache[file];
    const entries = getEntries(file);

    if (file.startsWith(context.srcDir) && !entries.includes(file)) {
      entries.push(file);
    }

    scheduleRun(entries);
  });

  watcher.on("change", (file) => {
    delete require.cache[file];
    scheduleRun(getEntries(file));
  });

  watcher.on("unlink", (file) => {
    delete require.cache[file];
    scheduleRun(getEntries(file));
  });

  scheduleRun(process.argv.length > 2 ? process.argv.slice(2) : undefined);
}

let running = new Promise<void>((resolve) => resolve());

function scheduleRun(files: string[] | undefined): void {
  if (files?.length === 0) {
    return;
  }

  running = running.then(() => ginny({ files, watch: true }));
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
