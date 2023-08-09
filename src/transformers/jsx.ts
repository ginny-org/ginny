import { relative, join, dirname, isAbsolute } from "path";
import { promises } from "fs";
import * as beautify from "js-beautify";

import { Context } from "../context";
import * as log from "../log";
import { PageContext } from "../index";
import { Ginny } from "../types";
import type { TransformResult, Transformer } from ".";
import { record } from "../dependencies";
import { result, Result, UnwrapPromise } from "../asyncUtils";
import { TransformError } from "./support/error";
import { register, unregister } from "../dependencies";

export interface PageResult {
  filename: string;
  content: Promise<Ginny.Node> | Ginny.Node;
  postProcess?(html: string): Promise<string> | string;
}

export interface MultiPageResult {
  pages: PageResult[];
}

export interface PageImport {
  default(
    context: PageContext
  ): Promise<Ginny.Node> | Ginny.Node | PageResult | Promise<PageResult> | MultiPageResult | Promise<MultiPageResult>;
}

export function match(filename: string): boolean {
  return /\.(j|t)sx$/.test(filename);
}

export const process: Transformer = async (file, context): Promise<TransformResult> => {
  const relpath = relative(context.srcDir, file);
  log.prepare(relpath);

  register(context);

  try {
    return await run(file, relpath, context);
  } finally {
    unregister();
  }
};

function makeErrorResult(filename: string, error: Error): TransformResult {
  if (error instanceof TypeError) {
    const stack = error.stack?.toString();
    let location = { line: 0, col: 0 };
    let message = error.message.toString();

    if (stack) {
      const m = stack.match(/at (.*)\((.*?):([\d]+):([\d]+)\)/);

      if (m && m[2].endsWith(filename)) {
        location = { line: parseInt(m[3], 10), col: parseInt(m[4], 10) };
        message = `at ${m[1].trim()}: ${message}`;
      }
    }

    return { errors: [new TransformError(filename, { start: location, end: location }, message)] };
  }

  const location = { line: 0, col: 0 };
  return { errors: [new TransformError(filename, { start: location, end: location }, error.message.toString())] };
}

async function run(file: string, relpath: string, context: Context): Promise<TransformResult> {
  const ret: Result<PageImport> = await result(import(relative(__dirname, file)));

  if (!ret.ok) {
    return makeErrorResult(file, ret.error);
  }

  const func = ret.value?.default;

  if (!func || typeof func !== "function") {
    log.processed(relpath);
    return {};
  }

  const pageContext = createPageContext(file, context);
  let generated: UnwrapPromise<ReturnType<typeof func>>;

  try {
    generated = await func(pageContext);
  } catch (err) {
    return makeErrorResult(file, err as Error);
  }

  const outPages: { dest: string; content: string; postProcess?(html: string): Promise<string> | string }[] =
    "text" in generated
      ? [{ dest: relpath, content: generated.text }]
      : "filename" in generated
      ? [{ dest: generated.filename, content: (await generated.content).text, postProcess: generated.postProcess }]
      : "pages" in generated
      ? await Promise.all(
          generated.pages.map(async (page) => ({
            dest: page.filename,
            content: (await page.content).text,
            postProcess: page.postProcess
          }))
        )
      : [];

  if ("pages" in generated) {
    for (const page of outPages) {
      log.prepare(page.dest);
    }
  }

  await Promise.all(
    outPages.map(async ({ content, dest, postProcess }) => {
      const contentWithDocType = `<!doctype html>
${content}`;

      const process = postProcess ?? ((html: string) => html);

      const html = await process(
        beautify.html_beautify(contentWithDocType, {
          end_with_newline: true,
          indent_size: 2,
          indent_with_tabs: false
        })
      );

      const destPath = join(context.outDir, dest).replace(/\.[jt]sx$/, ".html");
      const destDir = dirname(destPath);

      await promises.mkdir(destDir, { recursive: true });
      await promises.writeFile(destPath, html, "utf-8");

      if ("pages" in generated) {
        log.processed(dest);
      }
    })
  );

  log.processed(relpath);
  return {};
}

function createPageContext(file: string, context: Context): PageContext {
  const relpath = relative(dirname(file), context.srcDir);

  return {
    srcDir: context.srcDir,
    rootDir: dirname(context.packageInfo.path),
    isWatch: context.isWatch,
    environment: context.environment,

    addDependency: (dependency) => record(file, dependency, context),

    resolve: (filepath) => (isAbsolute(filepath) ? filepath : join(dirname(file), filepath)),

    url(path): string {
      return join(relpath ?? ".", path);
    },

    forFile(newFile: string): PageContext {
      const fullPath = join(dirname(file), newFile);
      return createPageContext(fullPath, context);
    }
  };
}
