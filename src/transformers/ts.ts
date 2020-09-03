import * as ts from "typescript";

import * as log from "../log";
import { relative, basename } from "path";
import { promises } from "fs";
import { prepareWriteTarget } from "./support/utils";
import type { TransformResult, Transformer } from ".";
import { TransformError } from "./support/error";

export function match(filename: string): boolean {
  return /\.ts$/.test(filename);
}

export const process: Transformer = async (filename, context): Promise<TransformResult> => {
  if (/\.d\.ts$/.test(filename)) {
    return {};
  }

  if (basename(filename)[0] === "_") {
    return {};
  }

  const relpath = relative(context.srcDir, filename);
  log.prepare(relpath);

  const options: ts.CompilerOptions = {
    strict: true,
    module: ts.ModuleKind.AMD,
    outFile: "out.js"
  };

  let content!: string;
  const host = ts.createCompilerHost(options);

  host.writeFile = (filename, data) => {
    content = data;
  };

  const program = ts.createProgram([filename], options, host);
  const emitResult = program.emit();

  const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

  if (allDiagnostics.length) {
    const errors = allDiagnostics
      .map((d) => {
        if (d.file == null || d.start == null || d.length == null || d.file.fileName == null) {
          return null;
        }

        const tsStart = d.file.getLineAndCharacterOfPosition(d.start);
        const tsEnd = d.file.getLineAndCharacterOfPosition(d.start + d.length);
        const start = { line: tsStart.line, col: tsStart.character };
        const end = { line: tsEnd.line, col: tsEnd.character };
        const message = ts.flattenDiagnosticMessageText(d.messageText, "\n");

        return new TransformError(relative(context.srcDir, d.file.fileName), { start, end }, message);
      })
      .filter((v): v is TransformError => !!v);

    log.processed(relpath);
    return { errors };
  }

  const amdified = `
  (function() {
    const __modules = {};

    function require() {}

    function define(moduleName, dependencies, callback) {
      const exports = {};

      const args = dependencies.map(function (dependency) {
        switch (dependency) {
          case "exports":
            return exports;
          case "require":
            return require;
          default:
            return __modules[dependency];
        }
      });

      callback.apply(null, args);
      __modules[moduleName] = exports;
    }

    ${content}
  })();
  `;

  const destPath = await (await prepareWriteTarget(filename, context)).replace(/\.ts$/, ".js");
  await promises.writeFile(destPath, amdified, "utf-8");

  log.processed(relpath);
  return {};
};
