import { Context } from "../context";
import * as log from "../log";

import { relative, join, dirname } from "path";
import { promises } from "fs";

export function match(): boolean {
  return true;
}

export async function process(file: string, context: Context): Promise<void> {
  if (context.srcDir === context.outDir) {
    return;
  }

  const relpath = relative(context.srcDir, file);
  log.prepare(relpath);

  const dest = join(context.outDir, relative(context.srcDir, file));
  await promises.mkdir(dirname(dest), { recursive: true });
  await promises.copyFile(file, dest);
  log.processed(relpath);
}
