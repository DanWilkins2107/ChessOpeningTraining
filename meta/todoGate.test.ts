import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { lineProblems } from './todoGate';
import { startOfTodayUtc } from './today';

const LOCKFILE = /(^|\/)(package-lock\.json|npm-shrinkwrap\.json|[^/]*\.lock)$/;
const GATE_DIR = 'meta/';

const repoRoot = path.join(import.meta.dirname, '..');

describe('todo gate', () => {
  it('finds no rotten TODOs in tracked files', () => {
    expect(rottenTodos()).toEqual([]);
  });
});

function rottenTodos(): string[] {
  const today = startOfTodayUtc();
  const found: string[] = [];

  for (const file of scannedFiles()) {
    const text = readTextFile(file);
    if (text === null) continue;

    text.split(/\r?\n/).forEach((line, index) => {
      for (const problem of lineProblems(line, today)) {
        found.push(`${file}:${index + 1}: ${problem}`);
      }
    });
  }

  return found;
}

function scannedFiles(): string[] {
  return execFileSync('git', ['ls-files', '-z'], { cwd: repoRoot })
    .toString('utf8')
    .split('\0')
    .filter(
      (file) =>
        file !== '' && !file.startsWith(GATE_DIR) && !LOCKFILE.test(file),
    );
}

function readTextFile(file: string): string | null {
  const contents = readFileSync(path.join(repoRoot, file));
  return contents.includes(0) ? null : contents.toString('utf8');
}
