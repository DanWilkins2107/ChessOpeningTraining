import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { MARKER, lineProblems } from '../../meta/todoGate';

export type TemporaryExclude = { path: string; reason: string };

export type ModuleSources = Record<string, string>;

const SOURCE = /\.(tsx?|css)$/;
const COMPANION_TEST = /\.test\.tsx?$/;
const RELATIVE_IMPORT = /\b(?:from|import)\s*\(?\s*['"](\.[^'"]*)['"]/g;
const RESOLVED_EXTENSIONS = ['', '.ts', '.tsx'];

const HAS_MARKER = new RegExp(String.raw`\b${MARKER}\b`, 'i');

const repoRoot = path.join(import.meta.dirname, '..');

export function moduleSources(): ModuleSources {
  return Object.fromEntries(
    trackedModules().map((file) => [
      file,
      readFileSync(path.join(repoRoot, file), 'utf8'),
    ]),
  );
}

export function placementProblems(
  sources: ModuleSources,
  exempt: string[],
): string[] {
  return Object.entries(misplacements(sources))
    .filter(([modulePath]) => !exempt.includes(modulePath))
    .map(([modulePath, reason]) => `${modulePath}: ${reason}`);
}

export function excludeProblems(
  sources: ModuleSources,
  rootExceptions: string[],
  temporary: TemporaryExclude[],
  today: Date = startOfTodayUtc(),
): string[] {
  const misplaced = misplacements(sources);
  const problems = rootExceptions
    .filter((modulePath) => !(modulePath in sources))
    .map((modulePath) => `${modulePath}: root exception names no module`);

  for (const { path: modulePath, reason } of temporary) {
    if (!(modulePath in sources)) {
      problems.push(`${modulePath}: exclude names no module`);
      continue;
    }
    if (!(modulePath in misplaced)) {
      problems.push(`${modulePath}: exclude is no longer needed`);
    }
    if (!HAS_MARKER.test(reason)) {
      problems.push(`${modulePath}: exclude needs a ${MARKER} id and expiry`);
      continue;
    }
    problems.push(
      ...lineProblems(reason, today).map(
        (problem) => `${modulePath}: ${problem}`,
      ),
    );
  }

  return problems;
}

function misplacements(sources: ModuleSources): Record<string, string> {
  const consumers = consumersByModule(sources);
  const found: Record<string, string> = {};

  for (const modulePath of Object.keys(sources)) {
    if (!isPlaceable(modulePath)) continue;

    const owners = [
      ...new Set((consumers[modulePath] ?? []).map(owningFolder)),
    ].sort();
    if (owners.length === 0) continue;

    const required = requiredFolder(owners);
    if (declaredFolder(modulePath) === required) continue;

    found[modulePath] =
      `consumed from ${owners.join(', ')}, so it belongs in ${required}`;
  }

  return found;
}

function consumersByModule(sources: ModuleSources): Record<string, string[]> {
  const consumers: Record<string, string[]> = {};

  for (const [file, text] of Object.entries(sources)) {
    for (const target of importedModules(file, text)) {
      const resolved = resolveModule(target, sources);
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

const isPlaceable = (modulePath: string) =>
  declaredFolder(modulePath) !== null || modulePath.split('/').length === 2;

function declaredFolder(modulePath: string): string | null {
  const folders = modulePath.split('/').slice(0, -1);
  const innermost = folders.lastIndexOf('elements');
  return innermost === -1 ? null : folders.slice(0, innermost + 1).join('/');
}

function owningFolder(modulePath: string): string {
  const folders = modulePath.split('/').slice(0, -1);
  while (folders.at(-1) === 'elements') folders.pop();
  return collapsePages(folders.join('/'));
}

function requiredFolder(owners: string[]): string {
  const shared = owners.reduce(commonPrefix);
  return `${collapsePages(shared)}/elements`;
}

function commonPrefix(left: string, right: string): string {
  const [a, b] = [left.split('/'), right.split('/')];
  let shared = 0;
  while (shared < a.length && a[shared] === b[shared]) shared += 1;
  return a.slice(0, shared).join('/');
}

const collapsePages = (folder: string) =>
  folder === 'src/pages' ? 'src' : folder;

function trackedModules(): string[] {
  return execFileSync('git', ['ls-files', '-z', 'src'], { cwd: repoRoot })
    .toString('utf8')
    .split('\0')
    .filter((file) => SOURCE.test(file) && !COMPANION_TEST.test(file));
}

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}
