import * as beautify from "js-beautify";
import { Ginny } from "../types";
import type { TransformResult, Transformer } from ".";
import { runJavascriptPages } from "./support/js";

export interface NodeWithPostprocess {
  node: Ginny.Node;
  postProcess(html: string): string | Promise<string>;
}

export type Content = Ginny.Node | NodeWithPostprocess;

const suffix = /\.[j|t]sx$/;

export function match(filename: string): boolean {
  return suffix.test(filename);
}

export const process: Transformer = async (file, context): Promise<TransformResult> => {
  return runJavascriptPages<Content>(file, context, {
    contentToBuffer: async (content) => {
      const { node, postProcess } = nodeAndPostprocess(content);

      const contentWithDocType = `<!doctype html>
${node.text}`;

      const html = await postProcess(
        beautify.html_beautify(contentWithDocType, {
          end_with_newline: true,
          indent_size: 2,
          indent_with_tabs: false
        })
      );

      return Buffer.from(html, "utf-8");
    },
    destFilename: (filename) => filename.replace(suffix, ".html")
  });
};

function nodeAndPostprocess(content: Content): NodeWithPostprocess {
  return "postProcess" in content ? content : { node: content, postProcess: (html) => html };
}
