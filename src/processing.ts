import { join, dirname, relative, basename } from "path";
import { promises } from "fs";
import { Context } from "./context";
import { PageContext } from ".";
import { Ginny } from "./types";
import * as log from "./log";
import * as beautify from "js-beautify";
import * as sass from "node-sass";
import { promisify } from "util";

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

export async function processFile(file: string, context: Context): Promise<void> {
  const extension = file.replace(/.*\./, "");

  switch (extension) {
    case "tsx":
    case "jsx":
      return processJsx(file, context);
    case "scss":
      return processScss(file, context);
    default:
      return processOther(file, context);
  }
}

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

async function processJsx(file: string, context: Context): Promise<void> {
  const relpath = relative(context.srcDir, file);
  log.prepare(relpath);

  const ret: PageImport = await import(relative(__dirname, file));

  if (!ret || !ret.default || typeof ret.default !== "function") {
    log.processed(relpath);
    return;
  }

  const pageContext = createPageContext(file, context);
  const generated = await ret.default(pageContext);

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
}

async function processScss(file: string, context: Context): Promise<void> {
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
  const destPath = join(context.outDir, dest).replace(/\.[jt]sx$/, ".html");
  const destDir = dirname(destPath);

  await promises.mkdir(destDir, { recursive: true });
  await promises.writeFile(destPath, outCss, "utf-8");

  log.processed(dest);
}

async function processOther(file: string, context: Context): Promise<void> {
  if (context.srcDir !== context.outDir) {
    const relpath = relative(context.srcDir, file);
    log.prepare(relpath);

    const dest = join(context.outDir, relative(context.srcDir, file));
    await promises.mkdir(dirname(dest), { recursive: true });
    await promises.copyFile(file, dest);
    log.processed(relpath);
  }
}
