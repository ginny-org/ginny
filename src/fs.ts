import { promises } from "fs";
import { join } from "path";

const { readdir, lstat } = promises;

export async function* listAllFiles(p: string): AsyncGenerator<string, void, undefined> {
  for (const entry of await readdir(p)) {
    const fullname = join(p, entry);

    if (await isdir(fullname)) {
      yield* listAllFiles(fullname);
    } else {
      yield fullname;
    }
  }
}

async function isdir(p: string): Promise<boolean> {
  return (await lstat(p)).isDirectory();
}
