import * as jsx from "./jsx";
import * as scss from "./scss";
import * as ts from "./ts";
import { Context } from "../context";
import { TransformError } from "./support/error";

export interface TransformResult {
  errors?: TransformError[];
}

export class NoTransformerError extends Error {
  constructor() {
    super("No transformer found");
  }
}

export type Transformer = (filename: string, context: Context) => Promise<TransformResult>;
const transformers = [jsx, scss, ts];

export function process(filename: string, context: Context): Promise<TransformResult> {
  for (const transformer of transformers) {
    if (transformer.match(filename)) {
      return transformer.process(filename, context);
    }
  }

  throw new NoTransformerError();
}
