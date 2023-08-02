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

export const createContext = create;

export async function ginny(options?: Options): Promise<void> {
  const context = await create({ isWatch: !!options?.watch });

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

export interface PageContext {
  /** The source directory of the main tsx entry point. */
  srcDir: string;

  /** The root directory of the project. */
  rootDir: string;

  /** Whether ginny is running in development (aka watch) mode. */
  isDevelopment: boolean;

  /**
   * Resolves a filepath to an absolute path. Relative file paths
   * are resolved relative to the .tsx file location.
   */
  resolve(filepath: string): string;

  /**
   * Returns a path that can be used as a (relative) url from the
   * generated page to an external resource (e.g. an image).
   */
  url(path: string): string;

  /**
   * Creates a new page context for a different file. This can be
   * useful when generating multiple pages (e.g. in separate folders).
   */
  forFile(file: string): PageContext;

  /**
   * Registers an external file that is a dependency of the page.
   * This is used in watch mode to trigger regeneration of files
   * when dependencies change.
   */
  addDependency(dependency: string): void;
}

export interface Options {
  files?: string[];
  watch?: boolean;
  dependencyGraph?: boolean;
}

export default (opts?: Options): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => ginny(opts).then(resolve, reject), 0);
  });
};
