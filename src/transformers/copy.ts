import * as log from "../log";
import type { Transformer, TransformResult } from "./index";

import { relative } from "path";
import { promises } from "fs";
import { prepareWriteTarget } from "./support/utils";

export const process: Transformer = async (file, context): Promise<TransformResult> => {
  if (context.srcDir === context.outDir) {
    return {};
  }

  const relpath = relative(context.srcDir, file);
  log.prepare(relpath);

  const destPath = await prepareWriteTarget(file, context);
  await promises.copyFile(file, destPath);

  log.processed(relpath);
  return {};
};
