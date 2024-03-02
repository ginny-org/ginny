import { promises, existsSync } from "fs";
import { readFile } from "fs/promises";
import { join, dirname, isAbsolute } from "path";

export interface Context {
  packageInfo: PackageInfo;
  srcDir: string;
  rootDir: string;
  outDir: string;
  generatedFiles: Set<string>;
  purgecssConfig: string | null;
  cssNanoConfig: string | null;
  ignoreGlobs: string[];
  isWatch: boolean;
  environment: string;
}

interface PackageInfo {
  path: string;

  json: {
    main?: string;
    style?: string;
    directories?: {
      lib?: string;
    };
    ginny?: {
      out?: string;
      src?: string;
    };
  };
}

interface Options {
  isWatch: boolean;
  environment: string;
  out: string | undefined;
  src: string | undefined;
}

/**
 * Create a new ginny context.
 */
export async function create(options: Options): Promise<Context> {
  const packageInfo = await findFirstPackageJSON(process.cwd());

  if (!packageInfo.ok) {
    console.error(packageInfo.error);
    process.exit(1);
  }

  const src =
    options.src ?? packageInfo.json.ginny?.src ?? (packageInfo.json.main ? dirname(packageInfo.json.main) : undefined);

  if (!src) {
    console.error("Please provide a source directory on the cli or in ginny.src or main in package.json");
    process.exit(1);
  }

  const root = isAbsolute(src) ? src : join(dirname(packageInfo.path), src);

  const outDir = options.out ?? packageInfo.json.ginny?.out ?? packageInfo.json.directories?.lib;

  if (!outDir) {
    console.error("Please provide an output directory on the cli or in ginny.out or directories.lib in package.json");
    process.exit(1);
  }

  const purgecssConfig = join(process.cwd(), "purgecss.config.js");
  const cssNanoConfig = join(process.cwd(), "cssnano.config.js");

  const ignoreGlobs = (await readFile(join(root, ".ginnyignore"), { encoding: "utf-8" }).catch(() => ""))
    .split("\n")
    .filter((v) => !!v);

  ignoreGlobs.push(".ginnyignore");

  return {
    packageInfo,
    srcDir: root,
    rootDir: dirname(packageInfo.path),
    outDir: isAbsolute(outDir) ? outDir : join(dirname(packageInfo.path), outDir),
    ignoreGlobs,
    generatedFiles: new Set<string>(),
    purgecssConfig: existsSync(purgecssConfig) ? purgecssConfig : null,
    cssNanoConfig: existsSync(cssNanoConfig) ? cssNanoConfig : null,
    isWatch: options.isWatch,
    environment: options.environment
  };
}

async function findFirstPackageJSON(p: string): Promise<PackageJSONResultOk | PackageJSONResultError> {
  const packageJSONPath = await findFirstPackageJSONPath(p);

  if (!packageJSONPath) {
    return { ok: false, error: "Failed to find package.json" };
  }

  try {
    const json = JSON.parse(await promises.readFile(packageJSONPath, "utf-8")) as PackageInfo["json"];
    return { ok: true, json, path: packageJSONPath };
  } catch (err) {
    return { ok: false, error: `Failed to parse package.json at ${packageJSONPath}: ${err}` };
  }
}

async function findFirstPackageJSONPath(p: string): Promise<string | null> {
  const fullname = join(p, "package.json");

  try {
    const stats = await promises.lstat(fullname);

    if (!stats.isDirectory()) {
      return fullname;
    }
  } catch (err) {
    err;
  }

  const up = dirname(p);

  if (up !== p) {
    return findFirstPackageJSONPath(up);
  }

  return null;
}

interface PackageJSONResultOk extends PackageInfo {
  ok: true;
}

interface PackageJSONResultError {
  ok: false;
  error: string;
}
