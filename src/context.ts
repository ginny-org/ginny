import { promises, existsSync } from "fs";
import { readFile } from "fs/promises";
import { join, dirname } from "path";

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
  isProduction: boolean;
}

interface PackageInfo {
  path: string;

  json: {
    main?: string;
    style?: string;
    directories?: {
      lib?: string;
    };
  };
}

interface Options {
  isWatch: boolean;
  isProduction: boolean;
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

  if (!packageInfo.json.main) {
    console.error("package.json does not specify a main entry point");
    process.exit(1);
  }

  const root = join(dirname(packageInfo.path), dirname(packageInfo.json.main));
  const lib = packageInfo.json.directories?.lib;

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
    outDir: lib ? join(dirname(packageInfo.path), lib) : root,
    ignoreGlobs,
    generatedFiles: new Set<string>(),
    purgecssConfig: existsSync(purgecssConfig) ? purgecssConfig : null,
    cssNanoConfig: existsSync(cssNanoConfig) ? cssNanoConfig : null,
    isWatch: options.isWatch,
    isProduction: options.isProduction
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
