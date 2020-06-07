import { join, dirname, relative } from "path";
import { promises } from "fs";
import * as prettier from "prettier";
import { Context } from "./context";
import { PageContext } from ".";
import { Ginny } from "./types";

interface PageImport {
  default(context: PageContext): Promise<Ginny.Node> | Ginny.Node;
}

export async function processFile(file: string, context: Context): Promise<void> {
  if (file.endsWith(".tsx")) {
    return processTsx(file, context);
  } else {
    return processOther(file, context);
  }
}

async function processTsx(file: string, context: Context): Promise<void> {
  const ret: PageImport = await import(relative(__dirname, file));

  if (!ret || !ret.default || typeof ret.default !== "function") {
    return;
  }

  const relpath = relative(dirname(file), context.srcDir);

  const pageContext: PageContext = {
    srcDir: context.srcDir,
    rootDir: dirname(context.packageInfo.path),
    url(path): string {
      return relpath ? join(relpath, path) : `./${path}`;
    }
  };

  const contentWithDocType = `<!doctype html>
${(await ret.default(pageContext)).text}`;

  const html = prettier.format(contentWithDocType, {
    parser: "html",
    htmlWhitespaceSensitivity: "css",
    printWidth: 120,
    tabWidth: 2,
    useTabs: false,
    singleQuote: false
  });

  const dest = join(context.outDir, relative(context.srcDir, file)).replace(/\.tsx$/, ".html");
  return promises.writeFile(dest, html, "utf-8");
}

async function processOther(file: string, context: Context): Promise<void> {
  if (context.srcDir !== context.outDir) {
    const dest = join(context.outDir, relative(context.srcDir, file));
    await promises.mkdir(dirname(dest), { recursive: true });
    await promises.copyFile(file, dest);
  }
}
