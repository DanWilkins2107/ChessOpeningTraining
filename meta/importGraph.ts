import path from 'node:path';

export type ModuleSources = Record<string, string>;

const RELATIVE_IMPORT = /\b(?:from|import)\s*\(?\s*['"](\.[^'"]*)['"]/g;
const RESOLVED_EXTENSIONS = ['', '.ts', '.tsx'];

export function consumersByModule(
  sources: ModuleSources,
): Record<string, string[]> {
  const consumers: Record<string, string[]> = {};

  for (const [file, text] of Object.entries(sources)) {
    const imported = importedModules(file, text).map((target) =>
      resolveModule(target, sources),
    );
    for (const resolved of new Set(imported)) {
      if (resolved === null) continue;
      (consumers[resolved] ??= []).push(file);
    }
  }

  return consumers;
}

function importedModules(file: string, text: string): string[] {
  return [...text.matchAll(RELATIVE_IMPORT)].map(([, specifier]) =>
    path.posix.join(path.posix.dirname(file), specifier),
  );
}

function resolveModule(target: string, sources: ModuleSources): string | null {
  return (
    RESOLVED_EXTENSIONS.map((extension) => `${target}${extension}`).find(
      (candidate) => candidate in sources,
    ) ?? null
  );
}
