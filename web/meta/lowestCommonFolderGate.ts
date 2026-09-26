import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expiryProblem, startOfTodayUtc } from '../../meta/expiry';

export type TemporaryExclude = {
  path: string;
  expiry: string;
  reason: string;
};

export type ModuleSources = Record<string, string>;

const SOURCE = /\.(tsx?|css|svg)$/;
const TEST = /\.test\.tsx?$/;
const TEST_HELPER_FOLDER = 'tests-shared';
const PLACEMENT_FOLDERS = ['elements', 'shared', TEST_HELPER_FOLDER];
const RELATIVE_IMPORT = /\b(?:from|import)\s*\(?\s*['"](\.[^'"]*)['"]/g;
const RESOLVED_EXTENSIONS = ['', '.ts', '.tsx'];

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
    .filter(([unit]) => !exempt.includes(unit))
    .map(([unit, reason]) => `${unit}: ${reason}`);
}

export function excludeProblems(
  sources: ModuleSources,
  rootExceptions: string[],
  temporary: TemporaryExclude[],
  today: Date = startOfTodayUtc(),
): string[] {
  const misplaced = misplacements(sources);
  const units = new Set(Object.keys(sources).map(unitOf));
  const problems = rootExceptions
    .filter((modulePath) => !(modulePath in sources))
    .map((modulePath) => `${modulePath}: root exception names no module`);

  for (const { path: unit, expiry } of temporary) {
    if (!units.has(unit)) {
      problems.push(`${unit}: exclude names no module`);
      continue;
    }
    if (!(unit in misplaced)) {
      problems.push(`${unit}: exclude is no longer needed`);
    }
    const expired = expiryProblem(expiry, today);
    if (expired !== null) problems.push(`${unit}: ${expired}`);
  }

  return problems;
}

// A unit is a module folder with everything in it, or a lone file outside one.
function misplacements(sources: ModuleSources): Record<string, string> {
  const consumers = consumersByUnit(sources);
  const placeable = new Set(
    Object.keys(sources).filter(isPlaceable).map(unitOf),
  );
  const found: Record<string, string> = {};

  for (const unit of placeable) {
    const helper = isTestHelper(unit);
    const owners = [
      ...new Set(
        (consumers[unit] ?? [])
          .filter((consumer) => isTestCode(consumer) === helper)
          .map(owningFolder),
      ),
    ].sort();
    if (owners.length === 0) continue;

    const required = requiredFolder(owners, helper);
    if (declaredFolder(unit) === required) continue;

    found[unit] =
      `consumed from ${owners.join(', ')}, so it belongs in ${required}`;
  }

  return found;
}

function consumersByUnit(sources: ModuleSources): Record<string, string[]> {
  const consumers: Record<string, string[]> = {};

  for (const [file, text] of Object.entries(sources)) {
    for (const unit of importedUnits(file, text, sources)) {
      (consumers[unit] ??= []).push(file);
    }
  }

  return consumers;
}

function importedUnits(
  file: string,
  text: string,
  sources: ModuleSources,
): string[] {
  return importedModules(file, text)
    .map((target) => resolveModule(target, sources))
    .filter((resolved) => resolved !== null)
    .map(unitOf)
    .filter((unit) => unit !== unitOf(file));
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
  !TEST.test(modulePath) &&
  (declaredFolder(modulePath) !== null || modulePath.split('/').length === 2);

const isTestHelper = (modulePath: string) =>
  declaredFolder(modulePath)?.split('/').at(-1) === TEST_HELPER_FOLDER;

// App code places what it imports into elements or shared; tests and their
// helpers place what they import into tests-shared.
const isTestCode = (consumer: string) =>
  TEST.test(consumer) || isTestHelper(consumer);

function unitOf(modulePath: string): string {
  const folder = declaredFolder(modulePath);
  if (folder === null) return modulePath;
  const [moduleFolder, ...rest] = modulePath
    .slice(folder.length + 1)
    .split('/');
  return rest.length === 0 ? modulePath : `${folder}/${moduleFolder}`;
}

function declaredFolder(modulePath: string): string | null {
  const folders = modulePath.split('/').slice(0, -1);
  const innermost = Math.max(
    ...PLACEMENT_FOLDERS.map((shared) => folders.lastIndexOf(shared)),
  );
  return innermost === -1 ? null : folders.slice(0, innermost + 1).join('/');
}

function owningFolder(modulePath: string): string {
  const folder = declaredFolder(modulePath) ?? modulePath;
  return collapsePages(path.posix.dirname(folder));
}

function requiredFolder(owners: string[], helper: boolean): string {
  const shared = collapsePages(owners.reduce(commonPrefix));
  if (helper) return `${shared}/${TEST_HELPER_FOLDER}`;
  return `${shared}/${owners.length === 1 ? 'elements' : 'shared'}`;
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
    .filter((file) => SOURCE.test(file));
}
