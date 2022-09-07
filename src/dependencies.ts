import * as Module from "module";
import { Context } from "./context";

const moduleInternal = Module as unknown as ModuleInternal;

const dependencyToEntries = new Map<string, Set<string>>();
const entryToDependencies = new Map<string, Set<string>>();

export function record(entry: string, dependency: string, context: Context): void {
  if (
    isExternal(entry) ||
    isExternal(dependency) ||
    !entry.startsWith(context.rootDir) ||
    !dependency.startsWith(context.rootDir) ||
    entry === dependency
  ) {
    return;
  }

  ensureEntryToDependencies(entry).add(dependency);
  ensureDependencyToEntries(dependency).add(entry);
}

export function markChanged(file: string, context: Context): string[] {
  clearRequireCache(file);

  if (!file.startsWith(context.srcDir)) {
    return [];
  }

  // Collect top-level files that transitively depend on this file
  const toplevel = new Set<string>();
  getToplevelDependents(file, toplevel);

  // Delete dependencies for this file
  entryToDependencies.get(file)?.forEach((dependency) => {
    dependencyToEntries.get(dependency)?.delete(file);
  });

  return Array.from(toplevel.values());
}

function getToplevelDependents(file: string, out: Set<string>): void {
  const entries = dependencyToEntries.get(file);

  if (!entries || entries.size === 0) {
    out.add(file);
    return;
  }

  entries.forEach((entry) => getToplevelDependents(entry, out));
}

function clearRequireCache(file: string): void {
  delete require.cache[file];

  // Walk dependency tree up-wards and clear require cache
  const entries = dependencyToEntries.get(file);

  entries?.forEach((entry) => {
    if (entry !== file) {
      clearRequireCache(entry);
    }
  });
}

export function getEntries(dependency: string): string[] {
  const entries = dependencyToEntries.get(dependency);
  return entries ? Array.from(entries) : [];
}

export function register(context: Context): void {
  if (++numRegistered !== 1) {
    return;
  }

  moduleInternal._load = function (request, parent): unknown {
    const localPath = moduleInternal._resolveFilename(request, parent);

    if (localPath) {
      record(parent.filename, localPath, context);
    }

    return originalLoad.call(this, request, parent);
  };
}

export function unregister(): void {
  if (numRegistered === 0) {
    return;
  }

  if (--numRegistered === 0) {
    moduleInternal._load = originalLoad;
  }
}

export function getRelations(): [string, string][] {
  const ret: [string, string][] = [];

  entryToDependencies.forEach((dependencies, entry) =>
    dependencies.forEach((dependency) => {
      if (entry !== dependency) {
        ret.push([entry, dependency]);
      }
    })
  );

  return ret;
}

function ensureEntryToDependencies(entry: string): Set<string> {
  const existing = entryToDependencies.get(entry);

  if (!existing) {
    const dependencies = new Set([entry]);
    entryToDependencies.set(entry, dependencies);
    return dependencies;
  }

  return existing;
}

function ensureDependencyToEntries(dependency: string): Set<string> {
  const existing = dependencyToEntries.get(dependency);

  if (existing) {
    return existing;
  }

  const entries = new Set<string>();
  dependencyToEntries.set(dependency, entries);
  return entries;
}

const originalLoad = moduleInternal._load;
let numRegistered = 0;

const isExternal = (s: string): boolean => /[/\\]node_modules[/\\]/.test(s);

export interface DependencyRecorder {
  record(file: string): void;
}

interface ModuleInternal {
  _load(request: string, parent: Parent): unknown;
  _resolveFilename(filename: string, parent: Parent): string;
}

interface Parent {
  filename: string;
}
