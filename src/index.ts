import h from "./h";
import { listAllFiles } from "./fs";
import { promises, watch } from "fs";
import { create, Context } from "./context";
import { processFile } from "./processing";
import "ts-node/register";

export async function ginny(options?: Options): Promise<void> {
  const context = await create();

  if (!context) {
    process.exit(1);
  }

  runPass(context);
}

async function runPass(context: Context): Promise<void> {
  await promises.mkdir(context.outDir, { recursive: true });

  let all: Promise<void>[] = [];

  for await (const entry of listAllFiles(context.srcDir)) {
    all.push(processFile(entry, context));
  }

  await Promise.all(all);
}

declare global {
  const Ginny: {
    h: typeof h;
  };
}

(global as any).Ginny = { h };

export interface PageContext {
  srcDir: string;
  rootDir: string;

  url(path: string): string;
}

export interface Options {}

export default ginny;
