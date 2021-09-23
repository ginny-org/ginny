#!/usr/bin/env node

import ginny, { createContext } from ".";
import { spawn } from "child_process";
import * as path from "path";

async function run(): Promise<void> {
  const watchArgIndex = process.argv.indexOf("--watch");

  if (watchArgIndex !== -1) {
    const newArgs = process.argv.slice(1);
    newArgs.splice(watchArgIndex - 1, 1);

    await runWatch(newArgs);
  } else {
    await runBuild();
  }
}

async function runWatch(args: string[]): Promise<void> {
  console.log("Starting ginny in watch mode...\n");

  const nodeDevMain = require.resolve("node-dev");
  const nodeDevBin = path.resolve(path.dirname(nodeDevMain), "..", "..", ".bin", "node-dev");

  args.unshift("--respawn", "--clear", "--notify=false");

  const child = spawn(nodeDevBin, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit"
  });

  child.on("exit", (code) => process.exit(code ?? undefined));
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
