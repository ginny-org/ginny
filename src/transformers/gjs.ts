import type { TransformResult, Transformer } from ".";
import { runJavascriptPages } from "./support/js";

/** The result of the exported default function of a .jsx or .tsx file. */
export type Content = string | Buffer;

const suffix = /\.g\.[j|t]s$/;

export function match(filename: string): boolean {
  return suffix.test(filename);
}

export const process: Transformer = async (file, context): Promise<TransformResult> => {
  return runJavascriptPages<Content>(file, context, {
    contentToBuffer: (content: Content) => (typeof content === "string" ? Buffer.from(content, "utf-8") : content),
    destFilename: (filename) => filename.replace(suffix, "")
  });
};
