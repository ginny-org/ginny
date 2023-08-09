import { dirname, join, relative } from "path";
import * as purgecss from "purgecss";
import "./register";

import h from "./h";
import { listAllFiles } from "./fs";
import { promises } from "fs";
import { create, Context } from "./context";
import * as log from "./log";

export { Ginny } from "./types";
import * as transformers from "./transformers/index";
import { process as processCopy } from "./transformers/copy";
import { TransformError } from "./transformers/support/error";
import { isMatch } from "micromatch";
import { getEntries, getRelations } from "./dependencies";
import type { ContentFunction, ContentResult, FileResult, MultiFileResult } from "./transformers/support/content";
import type { Content as ContentJSX } from "./transformers/jsx";
import type { Content as ContentGJS } from "./transformers/gjs";

export const createContext = create;

export type { ContentContext } from "./transformers/support/ContentContext";

/** The exported default function signature for .jsx and .tsx files. */
export type ContentFunctionJSX = ContentFunction<ContentJSX>;

/** The result type of the ContentFunctionJSX signature for .jsx and .tsx files. */
export type ContentResultJSX = ContentResult<ContentJSX>;

/** The single file result type of the ContentFunctionJSX signature for .jsx and .tsx files. */
export type FileResultJSX = FileResult<ContentJSX>;

/** The multi file result type of the ContentFunctionJSX signature for .jsx and .tsx files. */
export type MultiFileResultJSX = MultiFileResult<ContentJSX>;

/** The exported default function signature for .g.js and .g.ts files. */
export type ContentFunctionGJS = ContentFunction<ContentGJS>;

/** The result type of the ContentFunctionGJS signature for .g.js and .g.ts files. */
export type ContentResultGJS = ContentResult<ContentGJS>;

/** The single file result type of the ContentFunctionGJS signature for .g.js and .g.ts files. */
export type FileResultGJS = FileResult<ContentGJS>;

/** The multi file result type of the ContentFunctionGJS signature for .g.js and .g.ts files. */
export type MultiFileResultGJS = MultiFileResult<ContentGJS>;

/**
 * Run the ginny site generator.
 */
export async function ginny(options?: Options): Promise<void> {
  const context = await create({ isWatch: !!options?.watch, environment: options?.environment ?? "" });

  await runPass(context, options);

  if (context.purgecssConfig) {
    const purger = new purgecss.PurgeCSS();
    const config = await import(context.purgecssConfig);
    const ret = await purger.purge({
      content: [
        join(context.outDir, "*.html"),
        join(context.outDir, "**/*.html"),
        join(context.outDir, "**/*.js"),
        join(context.outDir, "*.js")
      ],
      css: [join(context.outDir, "*.css"), join(context.outDir, "**/*.css")],
      ...config
    });

    await Promise.all(ret.filter((v) => !!v.file).map(({ file, css }) => promises.writeFile(file ?? "", css)));
  }
}

async function runPass(context: Context, options: Options | undefined): Promise<void> {
  await promises.mkdir(context.outDir, { recursive: true });

  const all: Promise<transformers.TransformResult>[] = [];

  if (options?.dependencyGraph) {
    log.silence(true);
  }

  log.start();

  const noTransformFiles: string[] = [];

  const tryTransform = async (file: string, context: Context): Promise<transformers.TransformResult> => {
    try {
      return await transformers.process(file, context);
    } catch (err) {
      if (err instanceof transformers.NoTransformerError) {
        noTransformFiles.push(file);
        return {};
      } else {
        throw err;
      }
    }
  };

  if (options?.files) {
    for (const file of options.files) {
      if (!isIgnored(file, context)) {
        all.push(tryTransform(file, context));
      }
    }
  } else {
    for await (const file of listAllFiles(context.srcDir)) {
      if (!isIgnored(file, context)) {
        all.push(tryTransform(file, context));
      }
    }
  }

  // Wait for all known transformers to finish. Files may be registered as dependencies during
  // transform which will be ignored for the default copy handler.
  await Promise.all(all);

  for (const file of noTransformFiles) {
    if (!isIgnored(file, context) && getEntries(file).length === 0) {
      all.push(processCopy(file, context));
    }
  }

  const errors = (await Promise.all(all)).reduce<TransformError[]>((a, b) => a.concat(b.errors ?? []), []);

  log.finish();

  for (const error of errors) {
    log.error(error.toString());
  }

  if (errors.length && !options?.watch) {
    process.exit(1);
  }

  if (options?.dependencyGraph) {
    const relations = getRelations();

    console.log("digraph dependencies {");
    const rootDir = dirname(context.packageInfo.path);

    const nodes = new Map<string, string>();

    const ensureNode = (filename: string) => {
      const existing = nodes.get(filename);

      if (existing) {
        return;
      }

      const name = `n${nodes.size}`;
      nodes.set(filename, name);
    };

    for (const [from, to] of relations) {
      ensureNode(from);
      ensureNode(to);
    }

    nodes.forEach((node, label) => {
      console.log(`  ${node} [label="${relative(rootDir, label)}"];`);
    });

    console.log("");

    for (const [from, to] of relations) {
      const fromNode = nodes.get(from);
      const toNode = nodes.get(to);
      console.log(`  ${fromNode} -> ${toNode};`);
    }

    console.log("}");
  }
}

function isIgnored(file: string, context: Context): boolean {
  return isMatch(srcDirRelative(file, context), context.ignoreGlobs, { dot: true });
}

function srcDirRelative(file: string, context: Context): string {
  if (file.startsWith(context.srcDir)) {
    return file.slice(context.srcDir.length + 1);
  }

  return file;
}

declare global {
  const Ginny: {
    h: typeof h;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).Ginny = { h };

/**
 * Ginny site generator options.
 */
export interface Options {
  /**
   * Files that are part of the site. Defaults to all files in the directory where the main
   * file lives.
   */
  files?: string[];

  /** Enable watch mode. Defaults to false. */
  watch?: boolean;

  /** The target environment. */
  environment?: string;

  /** Generate a dependency graph. Defaults to false. */
  dependencyGraph?: boolean;
}

export default (opts?: Options): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => ginny(opts).then(resolve, reject), 0);
  });
};
