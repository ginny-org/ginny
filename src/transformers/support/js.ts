import { relative, join, dirname } from "path";
import { promises } from "fs";

import { Context } from "../../context";
import * as log from "../../log";
import type { TransformResult } from "..";
import { register, unregister } from "../../dependencies";
import { result, Result, UnwrapPromise } from "../../asyncUtils";
import { TransformError } from "./error";
import { ContentFunction } from "./content";
import { ContentContext } from "./ContentContext";

interface Processor<Content> {
  contentToBuffer(content: Content): Buffer | Promise<Buffer>;
  destFilename(filename: string): string;
}

export async function runJavascriptPages<Content>(
  file: string,
  context: Context,
  processor: Processor<Content>
): Promise<TransformResult> {
  const relpath = relative(context.srcDir, file);
  log.prepare(relpath);

  register(context);

  try {
    return await run<Content>(file, relpath, context, processor);
  } finally {
    unregister();
  }
}

async function run<Content>(
  file: string,
  relpath: string,
  context: Context,
  processor: Processor<Content>
): Promise<TransformResult> {
  const ret: Result<ContentFunction<Content>> = await result(import(relative(__dirname, file)));

  if (!ret.ok) {
    return makeErrorResult(file, ret.error);
  }

  const func = ret.value?.default;

  if (!func || typeof func !== "function") {
    log.processed(relpath);
    return {};
  }

  const pageContext = new ContentContext(file, context);
  let generated: UnwrapPromise<ReturnType<typeof func>>;

  try {
    generated = await func(pageContext);
  } catch (err) {
    return makeErrorResult(file, err as Error);
  }

  const outPages: { dest: string; content: Content }[] =
    generated != null && typeof generated === "object" && "filename" in generated
      ? [{ dest: join(dirname(relpath), generated.filename), content: await generated.content }]
      : generated != null && typeof generated === "object" && "files" in generated
      ? await Promise.all(
          generated.files.map(async (page) => ({
            dest: join(dirname(relpath), page.filename),
            content: await page.content
          }))
        )
      : [{ dest: processor.destFilename(relpath), content: generated }];

  if (generated != null && typeof generated === "object" && "files" in generated) {
    for (const page of outPages) {
      log.prepare(page.dest);
    }
  }

  await Promise.all(
    outPages.map(async ({ content, dest }) => {
      const buffer = await processor.contentToBuffer(content);

      const destPath = join(context.outDir, dest).replace(/\.[jt]sx$/, ".html");
      const destDir = dirname(destPath);

      await promises.mkdir(destDir, { recursive: true });
      await promises.writeFile(destPath, buffer);

      if (generated != null && typeof generated === "object" && "files" in generated) {
        log.processed(dest);
      }
    })
  );

  log.processed(relpath);
  return {};
}

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
