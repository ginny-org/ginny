import { basename, relative, join, dirname } from "path";
import * as sass from "node-sass";
import * as beautify from "js-beautify";

import * as log from "../log";
import { Context } from "../context";
import { promisify } from "util";
import { promises } from "fs";

export function match(filename: string): boolean {
  return /\.scss$/.test(filename);
}

export async function process(file: string, context: Context): Promise<void> {
  if (basename(file)[0] === "_") {
    // Ignore partials
    return;
  }

  const relpath = relative(context.srcDir, file);
  log.prepare(relpath);

  const css = (
    await promisify(sass.render)({
      file: file,
      includePaths: ["node_modules"]
    })
  ).css.toString("utf-8");

  const outCss = beautify.css_beautify(css, { end_with_newline: true, indent_size: 2, indent_with_tabs: false });

  const dest = relative(context.srcDir, file.replace(/\.scss$/, ".css"));
  const destPath = join(context.outDir, dest);
  const destDir = dirname(destPath);

  await promises.mkdir(destDir, { recursive: true });
  await promises.writeFile(destPath, outCss, "utf-8");

  log.processed(dest);
}
