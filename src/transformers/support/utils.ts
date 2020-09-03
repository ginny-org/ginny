import { Context } from "../../context";
import { relative, join, dirname } from "path";
import { promises } from "fs";

export async function prepareWriteTarget(filename: string, context: Context): Promise<string> {
  const dest = relative(context.srcDir, filename);
  const destPath = join(context.outDir, dest);
  const destDir = dirname(destPath);

  await promises.mkdir(destDir, { recursive: true });
  return destPath;
}
