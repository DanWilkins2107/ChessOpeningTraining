import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

export type ComponentSources = Record<string, string>;

const MODULE = /\.tsx?$/;
const TEST = /\.test\.tsx?$/;
// Test stubs legitimately declare throwaway components next to each other.
const TEST_HELPER_FOLDER = 'tests-shared';

const DECLARATION =
  /^(?:export\s+)?(?:default\s+)?function\s+([A-Za-z_$][\w$]*)|^(?:export\s+)?const\s+([A-Za-z_$][\w$]*)[^=]*=\s*(?:\(|function\b|memo\(|forwardRef\()/;
const CAPITALISED = /^[A-Z]/;
const ALL_CAPS = /^[A-Z0-9_]+$/;
const HOOK = /^use[A-Z]/;

const repoRoot = path.join(import.meta.dirname, '..');

export function componentSources(): ComponentSources {
  return Object.fromEntries(
    trackedModules().map((file) => [
      file,
      readFileSync(path.join(repoRoot, file), 'utf8'),
    ]),
  );
}

export function componentPerFileProblems(sources: ComponentSources): string[] {
  return Object.entries(sources).flatMap(([file, text]) => {
    const declared = declaredComponents(text);
    if (declared.length < 2) return [];
    return [
      `${file}: declares ${declared.join(', ')} — one component or hook per file`,
    ];
  });
}

export const isScannedModule = (file: string) =>
  MODULE.test(file) &&
  !TEST.test(file) &&
  !file.split('/').includes(TEST_HELPER_FOLDER);

function declaredComponents(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map(declaredName)
    .filter((name) => name !== null)
    .filter(isComponentName);
}

function declaredName(line: string): string | null {
  const match = DECLARATION.exec(line);
  if (match === null) return null;
  return match[1] ?? match[2];
}

const isComponentName = (name: string) =>
  (CAPITALISED.test(name) && !ALL_CAPS.test(name)) || HOOK.test(name);

function trackedModules(): string[] {
  return execFileSync('git', ['ls-files', '-z', 'src'], { cwd: repoRoot })
    .toString('utf8')
    .split('\0')
    .filter(isScannedModule);
}
