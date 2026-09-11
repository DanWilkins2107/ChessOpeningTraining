import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { reasonProblems } from './fallowIgnoreGate';
import { startOfTodayUtc } from './today';

type Inventory = {
  files: {
    path: string;
    suppressions: { line: number; reason: string | null }[];
  }[];
};

const repoRoot = path.join(import.meta.dirname, '..');
const fallowBin = createRequire(import.meta.url).resolve('fallow/bin/fallow');

describe('fallow ignore gate', () => {
  it('finds no open-ended fallow-ignore markers', () => {
    expect(rottenSuppressions()).toEqual([]);
  });
});

function rottenSuppressions(): string[] {
  const today = startOfTodayUtc();
  return inventory().files.flatMap((file) =>
    file.suppressions.flatMap((suppression) =>
      reasonProblems(suppression.reason ?? '', today).map(
        (problem) => `${file.path}:${suppression.line}: ${problem}`,
      ),
    ),
  );
}

function inventory(): Inventory {
  const output = execFileSync(
    process.execPath,
    [fallowBin, 'suppressions', '--format', 'json'],
    { cwd: repoRoot },
  ).toString('utf8');
  return JSON.parse(output) as Inventory;
}
