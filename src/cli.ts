#!/usr/bin/env node

import ginny from ".";
import { watch } from "chokidar";
import { create } from "./context";
import { markChanged } from "./dependencies";
import { setupServer } from "./server";
import * as yargs from "yargs";
import { hideBin } from "yargs/helpers";

interface CliOptions {
  watch: boolean;
  production: boolean;
  dependencyGraph: boolean;
  files: string[];
}

async function run(): Promise<void> {
  const argv = await yargs(hideBin(process.argv))
    .option("watch", {
      type: "boolean",
      default: false,
      description: "Run in watch mode"
    })
    .option("production", {
      type: "boolean",
      default: false,
      description:
        "Enable production environment. This is made available to the tsx context to conditionally generate different content depending on the environment."
    })
    .option("dependency-graph", { type: "boolean", default: false, hidden: true })
    .usage("$0 [options] [...files]")
    .help()
    .parseAsync();

  const options: CliOptions = {
    production: argv.production,
    watch: argv.watch,
    dependencyGraph: argv.dependencyGraph,
    files: argv._.map((v) => `${v}`)
  };

  if (options.dependencyGraph) {
    await runDependencyGraph(options);
    return;
  }

  if (options.watch) {
    await runWatch(options);
    return;
  }

  await runBuild(options);
}

async function runWatch(options: CliOptions): Promise<void> {
  console.log("Starting ginny in watch mode...\n");

  const context = await create({ isWatch: true, isProduction: options.production });
  setupServer(context);

  const watcher = watch(process.cwd(), { ignoreInitial: true, ignored: ["node_modules", ".git", context.outDir] });

  watcher.on("add", (file) => {
    const entries = markChanged(file, context);

    if (file.startsWith(context.srcDir) && !entries.includes(file)) {
      entries.push(file);
    }

    scheduleRun(options, entries);
  });

  watcher.on("change", (file) => scheduleRun(options, markChanged(file, context)));
  watcher.on("unlink", (file) => scheduleRun(options, markChanged(file, context)));

  scheduleRun(options, options.files.length > 0 ? options.files : undefined);
}

let running = new Promise<void>((resolve) => resolve());

function scheduleRun(options: CliOptions, files: string[] | undefined): void {
  if (files?.length === 0) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  running = running.then(() => ginny({ files, watch: options.watch, production: options.production }).catch(() => {}));
}

async function runDependencyGraph(options: CliOptions): Promise<void> {
  return ginny({
    watch: false,
    production: options.production,
    files: options.files.length > 0 ? options.files : undefined,
    dependencyGraph: true
  });
}

async function runBuild(options: CliOptions): Promise<void> {
  return ginny({
    watch: false,
    production: options.production,
    files: options.files.length > 0 ? options.files : undefined
  });
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
