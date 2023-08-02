import { basename, relative } from "path";
import * as sass from "sass";
import * as beautify from "js-beautify";
import * as cssnano from "cssnano";
import * as autoprefixer from "autoprefixer";

import * as log from "../log";
import { record } from "../dependencies";
import { prepareWriteTarget } from "./support/utils";

import type { Transformer, TransformResult } from ".";
import { TransformError } from "./support/error";
import { readFile, writeFile } from "fs/promises";
import { Context } from "../context";
import postcss = require("postcss");

export function match(filename: string): boolean {
  return /\.(scss|css)$/.test(filename);
}

export const process: Transformer = async (file, context): Promise<TransformResult> => {
  const isScss = /\.scss$/.test(file);

  if (isScss && basename(file)[0] === "_") {
    // Ignore partials
    return {};
  }

  const relpath = relative(context.srcDir, file);
  log.prepare(relpath);

  const ret = await (isScss ? scssToCss(context, file, relpath) : readFile(file, { encoding: "utf-8" }));

  if (typeof ret !== "string") {
    return ret;
  }

  const css = await formatCss(context, ret);
  const destPath = (await prepareWriteTarget(file, context)).replace(/\.scss$/, ".css");
  await writeFile(destPath, css, "utf-8");

  log.processed(relpath);
  return {};
};

async function scssToCss(context: Context, file: string, relpath: string): Promise<string | TransformResult> {
  const errors: TransformError[] = [];

  const ret = await sass
    .compileAsync(file, {
      loadPaths: ["node_modules"]
    })
    .catch((err: sass.Exception) => {
      const loc = { line: err.span.start.line, col: err.span.start.column };
      errors.push(new TransformError(relpath, { start: loc, end: loc }, err.message));
      return null;
    });

  if (!ret) {
    return { errors };
  }

  for (const loadedUrl of ret.loadedUrls) {
    record(file, loadedUrl.pathname, context);
  }

  return ret.css;
}

async function formatCss(context: Context, css: string): Promise<string> {
  if (context.cssNanoConfig) {
    const ret = await postcss([cssnano(await import(context.cssNanoConfig)), autoprefixer()]).process(css, {
      from: undefined,
      map: false
    });

    return ret.css;
  }

  const ret = await postcss([autoprefixer()]).process(
    beautify.css_beautify(css, { end_with_newline: true, indent_size: 2, indent_with_tabs: false }),
    { from: undefined, map: false }
  );

  return ret.css;
}
