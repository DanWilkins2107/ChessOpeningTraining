import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

type Sources = Record<string, string>;

const SCANNED_FOLDERS = ['web/src', 'web/meta', 'meta', 'supabase'];
const TYPESCRIPT_EXTENSION = /\.tsx?$/;
const TEST = /\.test(\.tsx?)?$/;
const META = /^(web\/)?meta\//;
const RELATIVE_IMPORT = /\b(?:from|import)\s*\(?\s*['"](\.[^'"]*)['"]/g;

const repoRoot = path.join(import.meta.dirname, '..');

export function repoSources(): Sources {
  return Object.fromEntries(
    trackedModules().map((file) => [
      file,
      readFileSync(path.join(repoRoot, file), 'utf8'),
    ]),
  );
}

export function testImportProblems(sources: Sources): string[] {
  return Object.entries(sources)
    .filter(([file]) => !isTestSide(file))
    .flatMap(([file, text]) =>
      importedPaths(file, text)
        .filter(
          (imported) =>
            isTestSide(imported) || (isAppCode(file) && isMeta(imported)),
        )
        .map(
          (imported) =>
            `${file}: imports ${imported}, which only tests may import`,
        ),
    );
}

export function singleImporterProblems(sources: Sources): string[] {
  const importers: Record<string, string[]> = {};

  for (const [file, text] of Object.entries(sources)) {
    const helpers = importedPaths(file, text)
      .filter(isTestHelper)
      .map((helper) => helper.replace(TYPESCRIPT_EXTENSION, ''));
    for (const helper of new Set(helpers)) {
      (importers[helper] ??= []).push(file);
    }
  }

  return Object.entries(importers)
    .filter(([, files]) => files.length === 1)
    .map(
      ([helper, [file]]) => `${helper}: only ${file} imports it, so inline it`,
    );
}

function importedPaths(file: string, text: string): string[] {
  return [...text.matchAll(RELATIVE_IMPORT)].map(([, specifier]) =>
    path.posix.join(path.posix.dirname(file), specifier),
  );
}

const isTestHelper = (filePath: string) =>
  filePath.split('/').includes('tests-shared');

const isTestSide = (filePath: string) =>
  TEST.test(filePath) || isTestHelper(filePath);

const isAppCode = (filePath: string) => filePath.startsWith('web/src/');

const isMeta = (filePath: string) => META.test(filePath);

function trackedModules(): string[] {
  return execFileSync('git', ['ls-files', '-z', ...SCANNED_FOLDERS], {
    cwd: repoRoot,
  })
    .toString('utf8')
    .split('\0')
    .filter((file) => TYPESCRIPT_EXTENSION.test(file));
}
