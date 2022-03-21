const dependencyToEntries = new Map<string, Set<string>>();
const entryToDependencies = new Map<string, Set<string>>();

export function createDependencyRecorder(entry: string): DependencyRecorder {
  clearDependencies(entry);

  const dependencies = new Set([entry]);
  entryToDependencies.set(entry, dependencies);
  dependencyToEntries.set(entry, new Set([entry]));

  return {
    record(file: string): void {
      dependencies.add(file);
      ensureDependencyToEntry(file).add(entry);
    }
  };
}

export function getEntries(dependency: string): string[] {
  const entries = dependencyToEntries.get(dependency);
  return entries ? Array.from(entries) : [];
}

function ensureDependencyToEntry(dependency: string): Set<string> {
  const existing = dependencyToEntries.get(dependency);

  if (existing) {
    return existing;
  }

  const entries = new Set<string>();
  dependencyToEntries.set(dependency, entries);
  return entries;
}

function clearDependencies(entry: string): void {
  const existing = entryToDependencies.get(entry);

  if (existing == null) {
    return;
  }

  for (const dependency of existing) {
    dependencyToEntries.delete(dependency);
  }

  entryToDependencies.delete(entry);
}

export interface DependencyRecorder {
  record(file: string): void;
}
