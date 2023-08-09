import { dirname, isAbsolute, join, relative } from "path";
import { Context } from "../../context";
import { record } from "../../dependencies";

/**
 * Context containing properties and convenience methods related to the static site.
 */
export class ContentContext {
  /** The source directory of the main tsx entry point. */
  readonly srcDir: string;

  /** The root directory of the project. */
  readonly rootDir: string;

  /** Whether ginny is running in watch mode. */
  readonly isWatch: boolean;

  /** The target environment as provided by the user. */
  readonly environment: string;

  constructor(
    private file: string,
    private context: Context
  ) {
    this.srcDir = context.srcDir;
    this.rootDir = dirname(context.packageInfo.path);
    this.isWatch = context.isWatch;
    this.environment = context.environment;
  }

  /**
   * Resolves a filepath to an absolute path. Relative file paths
   * are resolved relative to the source file location.
   */
  resolve(filepath: string): string {
    return isAbsolute(filepath) ? filepath : join(dirname(this.file), filepath);
  }

  /**
   * Returns a path that can be used as a (relative) url from the
   * generated page to an external resource (e.g. an image).
   */
  url(path: string): string {
    const relpath = relative(dirname(this.file), this.srcDir);
    return join(relpath ?? ".", path);
  }

  /**
   * Creates a new page context for a different file. This can be
   * useful when generating multiple pages (e.g. in separate folders).
   */
  forFile(file: string): ContentContext {
    const fullPath = join(dirname(this.file), file);
    return new ContentContext(fullPath, this.context);
  }

  /**
   * Registers an external file that is a dependency of the page.
   * This is used in watch mode to trigger regeneration of files
   * when dependencies change.
   */
  addDependency(dependency: string): void {
    record(this.file, dependency, this.context);
  }
}
