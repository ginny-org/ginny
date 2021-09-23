import { basename, relative } from "path";
import * as sass from "sass";
import * as beautify from "js-beautify";

import * as log from "../log";
import { prepareWriteTarget } from "./support/utils";

import { promisify } from "util";
import { promises } from "fs";
import type { Transformer, TransformResult } from ".";
import { TransformError } from "./support/error";

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

  const ret = await promisify(sass.render)({
    file: file,
    includePaths: ["node_modules"]
  }).catch((err: sass.SassException) => {
    const loc = { line: err.line, col: err.column };
    errors.push(new TransformError(relpath, { start: loc, end: loc }, err.message));
    return null;
  });

  if (!ret) {
    return { errors };
  }

  const css = ret.css.toString("utf-8");
  const outCss = beautify.css_beautify(css, { end_with_newline: true, indent_size: 2, indent_with_tabs: false });

  const destPath = (await prepareWriteTarget(file, context)).replace(/\.scss$/, ".css");
  await promises.writeFile(destPath, outCss, "utf-8");

  log.processed(relpath);
  return {};
};
