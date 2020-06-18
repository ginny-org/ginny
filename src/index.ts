import h from "./h";
import { listAllFiles } from "./fs";
import { promises } from "fs";
import { create, Context } from "./context";
import { processFile } from "./processing";
import "ts-node/register/transpile-only";

export { Ginny } from "./types";

export const createContext = create;

export async function ginny(options?: Options): Promise<void> {
  const context = await create();

  if (!context) {
    process.exit(1);
  }

  runPass(context, options);
}

async function runPass(context: Context, options: Options | undefined): Promise<void> {
  await promises.mkdir(context.outDir, { recursive: true });

  const all: Promise<void>[] = [];

  console.log("\nStarting build");

  if (options?.files) {
    for (const file of options.files) {
      all.push(processFile(file, context));
    }
  } else {
    for await (const entry of listAllFiles(context.srcDir)) {
      all.push(processFile(entry, context));
    }
  }

  await Promise.all(all);
  console.log("Done\n");
}

declare global {
  const Ginny: {
    h: typeof h;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).Ginny = { h };

export interface PageContext {
  srcDir: string;
  rootDir: string;

  url(path: string): string;
  forFile(file: string): PageContext;
}

export interface Options {
  files?: string[];
}

export default ginny;
