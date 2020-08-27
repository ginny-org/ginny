#!/usr/bin/env node

import ginny, { createContext } from ".";
import { spawn } from "child_process";
import * as path from "path";

const watchArgIndex = process.argv.indexOf("--watch");

if (watchArgIndex !== -1) {
  console.log("Starting ginny in watch mode...\n");

  const tsNodeDevMain = require.resolve("ts-node-dev");
  const tsNodeDevBin = path.resolve(path.dirname(tsNodeDevMain), "..", "bin", "ts-node-dev");

  const newArgs = process.argv.slice(1);
  newArgs.splice(watchArgIndex - 1, 1);

  createContext()
    .then((context) => {
      newArgs.unshift("--respawn", "--transpile-only", "--clear", "--no-notify", "--watch", context.srcDir);

      const child = spawn(tsNodeDevBin, newArgs, {
        cwd: process.cwd(),
        env: process.env,
        stdio: "inherit"
      });

      child.on("exit", (code) => process.exit(code ?? undefined));
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
} else {
  try {
    ginny({
      files: process.argv.length > 2 ? process.argv.slice(2) : undefined
    }).catch((e) => {
      console.error(e);
      process.exit(1);
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
