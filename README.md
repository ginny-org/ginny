# ginny

ginny is a low-configuration static site generator leveraging `tsx`.

## Concept

The main idea behind ginny is that of an unopinionated site generator based on transforming single files. Each page is represented by a `tsx` source that simply renders the full HTML of the page. Most other file types (like .js, .png, etc) are simply copied to the output as is, or slightly processed based on modern best practices (e.g. .scss files will be transformed through sass).

## Setup

The basic setup involves installing ginny (`npm install ginny`) and pointing the `main` field in your `package.json` to the site index `.tsx` file. The `directories.lib` field in `package.json` specifies the output folder for the site and defaults to the source directory. You also need to specify the `jsxFactory` as the one provided by ginny in your tsconfig.json:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "Ginny.h"
  }
}
```

After this, use `npx ginny` to do a one time build of your site, or `npx ginny --watch` to run ginny in watch mode.

## Transformers

- `.jsx` / `.tsx`: jsx and tsx files are transformed by the ginny jsx factory to a corresponding `.html` file, with some additional rules (see [tsx transformers](#tsx-transformer)).
- `.scss`: scss files are transformed to corresponding css files using `sass`. Partials (sass files starting with `_`) are not copied to the destination.
- `.ts`: ts files are transformed by `swc` and output as `.js` files.

## jsx/tsx transformer

tsx files are transformed to html files by invoking a `default export` render function that should return a `tsx` node. The render function receives a [context](#contentcontext) that provides convenience functionality to add dependencies, resolve relative file paths, etc.

```ts
type RenderFunction = (context: ContentContext) => RenderResult | Promise<RenderResult>;

type RenderResult = Ginny.Node | FileResult | MultiFileResult;

interface FileResult {
  filename: string;
  content: Promise<Ginny.Node> | Ginny.Node;
}

interface MultiFileResult {
  pages: FileResult[];
}
```

Results can either be returned synchronously or asynchronously (using promises). There are three different result types:

1. A single tsx node. In this case a corresponding .html file will be created with the contents of the node.
2. An object specifying a different output filename and the node (or promise resolving to a node) to render to that filename.
   ```ts
   export interface FileResult {
     filename: string;
     content: Promise<Ginny.Node> | Ginny.Node;
   }
   ```
3. An object specifying multiple pages to output multiple files from a single tsx template.
   ```ts
   export interface MultiFileResult {
     pages: PageResult[];
   }
   ```

The third type of output is useful to generate multiple files from a set of sources (e.g. from a database, JSON files or markdown files).

### ContentContext

All tsx render functions get a content context with the following interface:

```ts
interface ContentContext {
  /** The source directory of the main tsx entry point. */
  srcDir: string;

  /** The root directory of the project. */
  rootDir: string;

  /** Whether ginny is running in watch mode. */
  isWatch: boolean;

  /** The target environment as provided by the user. */
  environment: string;

  /**
   * Resolves a filepath to an absolute path. Relative file paths
   * are resolved relative to the .tsx file location.
   */
  resolve(filepath: string): string;

  /**
   * Returns a path that can be used as a (relative) url from the
   * generated content to an external resource (e.g. an image).
   */
  url(path: string): string;

  /**
   * Creates a new content context for a different file. This can be
   * useful when generating multiple files (e.g. in separate folders).
   */
  forFile(file: string): ContentContext;

  /**
   * Registers an external file that is a dependency of the content.
   * This is used in watch mode to trigger regeneration of files
   * when dependencies change.
   */
  addDependency(dependency: string): void;
}
```

## Builtin tooling

- Postcss autoprefixer is used on all css files.
- If your project contains a `cssnano.config.js` file, then `cssnano` is used on all css files.
- If your project contains a `purgecss.config.js` file, then `purgecss` is used to remove unused CSS from your site.

## Who is this for?

As is typical for such projects, `ginny` is just for me. However I am happy to share it with anyone who is interested. I think it fills a nice niche of a simple tool for people that are very familiar with the node/js eco system and enjoy using jsx/tsx.
