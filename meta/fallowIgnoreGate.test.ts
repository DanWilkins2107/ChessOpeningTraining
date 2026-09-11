import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { startOfTodayUtc } from './expiry';
import { reasonProblem } from './fallowIgnoreGate';

type Suppression = {
  line: number;
  kind: string;
  reason: string | null;
};

type Inventory = {
  files: { path: string; suppressions: Suppression[] }[];
};

const repoRoot = path.join(import.meta.dirname, '..');
const fallowBin = createRequire(import.meta.url).resolve('fallow/bin/fallow');

describe('fallow ignore gate', () => {
  it('finds no open-ended unused-file ignores', () => {
    expect(rottenIgnores()).toEqual([]);
  });
});

function rottenIgnores(): string[] {
  const today = startOfTodayUtc();
  return inventory().files.flatMap((file) =>
    file.suppressions.flatMap((suppression) =>
      suppressionProblems(file.path, suppression, today),
    ),
  );
}

function suppressionProblems(
  file: string,
  suppression: Suppression,
  today: Date,
): string[] {
  if (suppression.kind !== 'unused-file') return [];

  const problem = reasonProblem(suppression.reason, today);
  return problem === null ? [] : [`${file}:${suppression.line}: ${problem}`];
}

function inventory(): Inventory {
  const output = execFileSync(
    process.execPath,
    [fallowBin, 'suppressions', '--format', 'json'],
    { cwd: repoRoot },
  ).toString('utf8');
  return JSON.parse(output) as Inventory;
}
