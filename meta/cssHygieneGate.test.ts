import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { cssProblems, type SourceFile } from './cssHygieneGate';

const ENTRY = 'src/main.tsx';
const SCANNED = /\.(tsx?|css)$/;

const repoRoot = path.join(import.meta.dirname, '..');

describe('css hygiene gate', () => {
  it('finds no stylesheet hygiene problems in src', () => {
    expect(cssProblems(scannedFiles(), ENTRY)).toEqual([]);
  });
});

function scannedFiles(): SourceFile[] {
  return execFileSync('git', ['ls-files', '-z', 'src'], { cwd: repoRoot })
    .toString('utf8')
    .split('\0')
    .filter((file) => SCANNED.test(file))
    .map((file) => ({
      path: file,
      text: readFileSync(path.join(repoRoot, file), 'utf8'),
    }));
}
