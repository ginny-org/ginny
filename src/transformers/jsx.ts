import { relative, join, dirname } from "path";
import { promises } from "fs";
import * as beautify from "js-beautify";

import { Context } from "../context";
import * as log from "../log";
import { PageContext } from "../index";
import { Ginny } from "../types";
import type { TransformResult, Transformer } from ".";

export interface PageResult {
  filename: string;
  content: Promise<Ginny.Node> | Ginny.Node;
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

  const ret: PageImport = await import(relative(__dirname, file));
  const func = ret.default;

  if (!ret || !func || typeof func !== "function") {
    log.processed(relpath);
    return {};
  }

  const pageContext = createPageContext(file, context);
  const generated = await func(pageContext);

  const outPages =
    "text" in generated
      ? [{ dest: relative(context.srcDir, file), content: generated.text }]
      : "filename" in generated
      ? [{ dest: generated.filename, content: (await generated.content).text }]
      : "pages" in generated
      ? await Promise.all(
          generated.pages.map(async (page) => ({ dest: page.filename, content: (await page.content).text }))
        )
      : [];

  for (const page of outPages) {
    log.prepare(page.dest);
  }

  await Promise.all(
    outPages.map(async ({ content, dest }) => {
      const contentWithDocType = `<!doctype html>
${content}`;

      const html = beautify.html_beautify(contentWithDocType, {
        end_with_newline: true,
        indent_size: 2,
        indent_with_tabs: false
      });

      const destPath = join(context.outDir, dest).replace(/\.[jt]sx$/, ".html");
      const destDir = dirname(destPath);

      await promises.mkdir(destDir, { recursive: true });
      await promises.writeFile(destPath, html, "utf-8");

      log.processed(dest);
    })
  );

  return {};
};

function createPageContext(file: string, context: Context): PageContext {
  const relpath = relative(dirname(file), context.srcDir);

  return {
    srcDir: context.srcDir,
    rootDir: dirname(context.packageInfo.path),

    url(path): string {
      return join(relpath ?? ".", path);
    },

    forFile(newFile: string): PageContext {
      const fullPath = join(dirname(file), newFile);
      return createPageContext(fullPath, context);
    }
  };
}
