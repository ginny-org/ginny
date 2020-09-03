import * as jsx from "./jsx";
import * as copy from "./copy";
import * as scss from "./scss";
import * as ts from "./ts";
import { Context } from "../context";
import { TransformError } from "./support/error";

export interface TransformResult {
  errors?: TransformError[];
}

export type Transformer = (filename: string, context: Context) => Promise<TransformResult>;
const transformers = [jsx, scss, ts];

export function process(filename: string, context: Context): Promise<TransformResult> {
  for (const transformer of transformers) {
    if (transformer.match(filename)) {
      return transformer.process(filename, context);
    }
  }

  return copy.process(filename, context);
}
