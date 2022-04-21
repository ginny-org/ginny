import { basename, relative } from "path";
import * as sass from "sass";
import * as beautify from "js-beautify";

import * as log from "../log";
import { record } from "../dependencies";
import { prepareWriteTarget } from "./support/utils";

import type { Transformer, TransformResult } from ".";
import { TransformError } from "./support/error";
import { writeFile } from "fs/promises";

export function match(filename: string): boolean {
  return /\.scss$/.test(filename);
}

export const process: Transformer = async (file, context): Promise<TransformResult> => {
  if (basename(file)[0] === "_") {
    // Ignore partials
    return {};
  }

  const relpath = relative(context.srcDir, file);
  log.prepare(relpath);

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

  const css = ret.css;
  const outCss = beautify.css_beautify(css, { end_with_newline: true, indent_size: 2, indent_with_tabs: false });

  const destPath = (await prepareWriteTarget(file, context)).replace(/\.scss$/, ".css");
  await writeFile(destPath, outCss, "utf-8");

  log.processed(relpath);
  return {};
};
