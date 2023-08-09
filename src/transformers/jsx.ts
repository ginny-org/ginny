import * as beautify from "js-beautify";
import { Ginny } from "../types";
import type { TransformResult, Transformer } from ".";
import { runJavascriptPages } from "./support/js";

/**
 * Result of the exported default function of a .jsx or .tsx file containing a postprocessing
 * step for the final generated HTML. This can be used for example to minify or purge CSS considering
 * the final full HTML content.
 */
export interface WithPostprocessContent {
  /** The jsx/tsx vdom node. */
  node: Ginny.Node;

  /** A postprocess function receiving the HTML of the page. */
  postprocess(html: string): string | Promise<string>;
}

/** The result of the exported default function of a .jsx or .tsx file. */
export type Content = Ginny.Node | WithPostprocessContent;

const suffix = /\.[j|t]sx$/;

export function match(filename: string): boolean {
  return suffix.test(filename);
}

export const process: Transformer = async (file, context): Promise<TransformResult> => {
  return runJavascriptPages<Content>(file, context, {
    contentToBuffer: async (content) => {
      const { node, postprocess: postProcess } = nodeAndPostprocess(content);

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

function nodeAndPostprocess(content: Content): WithPostprocessContent {
  return "postprocess" in content ? content : { node: content, postprocess: (html) => html };
}
