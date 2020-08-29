import * as jsx from "./jsx";
import * as copy from "./copy";
import * as scss from "./scss";
import * as ts from "./ts";
import { Context } from "../context";

export type Transformer = (filename: string, context: Context) => Promise<void>;
const transformers = [jsx, scss, ts];

export function process(filename: string, context: Context): Promise<void> {
  for (const transformer of transformers) {
    if (transformer.match(filename)) {
      return transformer.process(filename, context);
    }
  }

  return copy.process(filename, context);
}
