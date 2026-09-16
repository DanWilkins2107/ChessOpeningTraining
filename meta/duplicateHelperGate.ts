import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { repoRoot } from './repoPaths';

export type TestSources = Record<string, string>;

const TYPESCRIPT = /\.tsx?$/;
const TEST = /\.test\.tsx?$/;
const DECLARATION =
  /^(?:export\s+)?(?:async\s+)?(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/;

export function testSources(): TestSources {
  return Object.fromEntries(
    scannedFiles().map((file) => [
      file,
      readFileSync(path.join(repoRoot, file), 'utf8'),
    ]),
  );
}

export function duplicateDeclarations(sources: TestSources): string[] {
  const declaringFiles: Record<string, string[]> = {};

  for (const [file, text] of Object.entries(sources)) {
    for (const name of declaredNames(text)) {
      (declaringFiles[name] ??= []).push(file);
    }
  }

  return Object.entries(declaringFiles)
    .filter(([, files]) => files.length > 1)
    .map(([name, files]) => `${name}: declared in ${files.join(', ')}`);
}

function declaredNames(text: string): Set<string> {
  return new Set(
    text.split(/\r?\n/).flatMap((line) => {
      const match = DECLARATION.exec(line);
      return match === null ? [] : [match[1]];
    }),
  );
}

function scannedFiles(): string[] {
  return execFileSync('git', ['ls-files', '-z'], { cwd: repoRoot })
    .toString('utf8')
    .split('\0')
    .filter(isScanned);
}

const isScanned = (file: string) =>
  TYPESCRIPT.test(file) &&
  (TEST.test(file) || file.split('/').includes('tests-shared'));
