import { join } from "path";
import * as purgecss from "purgecss";
import "ts-node/register/transpile-only";
import postcss = require("postcss");
import * as cssnano from "cssnano";
import * as autoprefixer from "autoprefixer";

import h from "./h";
import { listAllFiles } from "./fs";
import { promises } from "fs";
import { create, Context } from "./context";
import * as log from "./log";

export { Ginny } from "./types";
import * as transformers from "./transformers/index";

export const createContext = create;

export async function ginny(options?: Options): Promise<void> {
  const context = await create();

  if (!context) {
    process.exit(1);
  }

  await runPass(context, options);

  if (context.purgecssConfig && context.packageInfo.json.style) {
    const purger = new purgecss.PurgeCSS();
    const config = await import(context.purgecssConfig);
    const ret = await purger.purge({
      content: [join(context.outDir, "*.html"), join(context.outDir, "**/*.html")],
      css: [context.packageInfo.json.style],
      ...config
    });

    await Promise.all(ret.filter((v) => !!v.file).map(({ file, css }) => promises.writeFile(file ?? "", css)));
  }

  if (context.cssNanoConfig && context.packageInfo.json.style) {
    const css = await promises.readFile(context.packageInfo.json.style);
    const ret = await postcss([cssnano(await import(context.cssNanoConfig)), autoprefixer()]).process(css, {
      from: undefined,
      map: false
    });
    await promises.writeFile(context.packageInfo.json.style, ret.css);
  }
}

async function runPass(context: Context, options: Options | undefined): Promise<void> {
  await promises.mkdir(context.outDir, { recursive: true });

  const all: Promise<void>[] = [];

  log.start();

  if (options?.files) {
    for (const file of options.files) {
      all.push(transformers.process(file, context));
    }
  } else {
    for await (const entry of listAllFiles(context.srcDir)) {
      all.push(transformers.process(entry, context));
    }
  }

  await Promise.all(all);
  log.finish();
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
