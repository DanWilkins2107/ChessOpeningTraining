import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expiryProblem, startOfTodayUtc } from '../../meta/expiry';
import { consumersByModule } from '../../meta/importGraph';
import type { ModuleSources } from '../../meta/importGraph';

export type TemporaryExclude = {
  path: string;
  expiry: string;
  reason: string;
};

const SOURCE = /\.(tsx?|css)$/;
const TEST = /\.test\.tsx?$/;
const SHARED_FOLDERS = ['elements', 'tests-shared'];

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

  for (const { path: modulePath, expiry } of temporary) {
    if (!(modulePath in sources)) {
      problems.push(`${modulePath}: exclude names no module`);
      continue;
    }
    if (!(modulePath in misplaced)) {
      problems.push(`${modulePath}: exclude is no longer needed`);
    }
    const expired = expiryProblem(expiry, today);
    if (expired !== null) problems.push(`${modulePath}: ${expired}`);
  }

  return problems;
}

function misplacements(sources: ModuleSources): Record<string, string> {
  const consumers = consumersByModule(sources);
  const found: Record<string, string> = {};

  for (const modulePath of Object.keys(sources)) {
    if (!isPlaceable(modulePath)) continue;

    const sharedFolder = sharedFolderOf(modulePath);
    const owners = [
      ...new Set(
        (consumers[modulePath] ?? [])
          .filter((consumer) => consumerFolderOf(consumer) === sharedFolder)
          .map(owningFolder),
      ),
    ].sort();
    if (owners.length === 0) continue;

    const required = requiredFolder(owners, sharedFolder);
    if (declaredFolder(modulePath) === required) continue;

    found[modulePath] =
      `consumed from ${owners.join(', ')}, so it belongs in ${required}`;
  }

  return found;
}

const isPlaceable = (modulePath: string) =>
  !TEST.test(modulePath) &&
  (declaredFolder(modulePath) !== null || modulePath.split('/').length === 2);

const isSharedFolder = (folder: string | undefined) =>
  SHARED_FOLDERS.some((shared) => shared === folder);

const sharedFolderOf = (modulePath: string) =>
  declaredFolder(modulePath)?.split('/').at(-1) ?? 'elements';

// App code places what it imports into elements; tests and their helpers place
// what they import into tests-shared.
const consumerFolderOf = (consumer: string) =>
  TEST.test(consumer) ? 'tests-shared' : sharedFolderOf(consumer);

function declaredFolder(modulePath: string): string | null {
  const folders = modulePath.split('/').slice(0, -1);
  const innermost = Math.max(
    ...SHARED_FOLDERS.map((shared) => folders.lastIndexOf(shared)),
  );
  return innermost === -1 ? null : folders.slice(0, innermost + 1).join('/');
}

function owningFolder(modulePath: string): string {
  const folders = modulePath.split('/').slice(0, -1);
  while (isSharedFolder(folders.at(-1))) folders.pop();
  return collapsePages(folders.join('/'));
}

function requiredFolder(owners: string[], sharedFolder: string): string {
  const shared = owners.reduce(commonPrefix);
  return `${collapsePages(shared)}/${sharedFolder}`;
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
