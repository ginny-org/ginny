#!/usr/bin/env node

import ginny, { createContext } from ".";
import { spawn } from "child_process";
import * as path from "path";

const watchArgIndex = process.argv.indexOf("--watch");

if (watchArgIndex !== -1) {
  console.log("Starting ginny in watch mode...\n");

  // Run using ts-node-dev
  const tsnd = path.join(__dirname, "..", "node_modules", ".bin", "ts-node-dev");

  const newArgs = process.argv.slice(1);
  newArgs.splice(watchArgIndex - 1, 1);

  createContext().then((context) => {
    newArgs.unshift("--respawn", "--transpileOnly", "--watch", context.srcDir);

    const child = spawn(tsnd, newArgs, {
      cwd: process.cwd(),
      env: process.env,
      stdio: "inherit"
    });

    child.on("exit", (code) => process.exit(code ?? undefined));
  });
} else {
  try {
    ginny({
      files: process.argv.length > 2 ? process.argv.slice(2) : undefined
    });
  } catch (e) {
    console.error(e);
  }
}
