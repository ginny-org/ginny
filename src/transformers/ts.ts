import * as ts from "typescript";

import { Context } from "../context";
import * as log from "../log";
import { relative, join, dirname } from "path";
import { promises } from "fs";

export function match(filename: string): boolean {
  return /\.ts$/.test(filename);
}

export async function process(filename: string, context: Context): Promise<void> {
  const relpath = relative(context.srcDir, filename);
  log.prepare(relpath);

  const options: ts.CompilerOptions = {
    strict: true,
    module: ts.ModuleKind.UMD
  };

  const host = ts.createCompilerHost(options);

  let content!: string;
  host.writeFile = (filename, data) => (content = data);

  const program = ts.createProgram([filename], options, host);
  program.emit();

  const dest = relative(context.srcDir, filename.replace(/\.ts$/, ".js"));
  const destPath = join(context.outDir, dest);
  const destDir = dirname(destPath);

  await promises.mkdir(destDir, { recursive: true });
  await promises.writeFile(destPath, content, "utf-8");

  log.processed(dest);
}
