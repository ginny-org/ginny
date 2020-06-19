import { join, dirname, relative } from "path";
import { promises } from "fs";
import { Context } from "./context";
import { PageContext } from ".";
import { Ginny } from "./types";
import * as beautify from "js-beautify";

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
  if (file.endsWith(".tsx")) {
    return processTsx(file, context);
  } else {
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

async function processTsx(file: string, context: Context): Promise<void> {
  const ret: PageImport = await import(relative(__dirname, file));

  if (!ret || !ret.default || typeof ret.default !== "function") {
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

  await Promise.all(
    outPages.map(async ({ content, dest }) => {
      const contentWithDocType = `<!doctype html>
${content}`;

      const html = beautify.html_beautify(contentWithDocType, {
        end_with_newline: true,
        indent_size: 2,
        indent_with_tabs: false
      });

      const destPath = join(context.outDir, dest).replace(/\.tsx$/, ".html");
      const destDir = dirname(destPath);

      await promises.mkdir(destDir, { recursive: true });
      await promises.writeFile(destPath, html, "utf-8");

      console.log("Created", dest);
    })
  );
}

async function processOther(file: string, context: Context): Promise<void> {
  if (context.srcDir !== context.outDir) {
    const dest = join(context.outDir, relative(context.srcDir, file));
    await promises.mkdir(dirname(dest), { recursive: true });
    await promises.copyFile(file, dest);
  }
}
