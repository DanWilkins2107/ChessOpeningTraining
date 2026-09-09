import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const MAX_DAYS_AHEAD = 30;
const FORMAT = 'TODO <8-hex AgentJira node id> <YYYY-MM-DD>: description';
const MS_PER_DAY = 86_400_000;

const TODO_WORD = /\btodo\b/gi;
const TODO_FORMAT = /^TODO [0-9a-f]{8} (\d{4}-\d{2}-\d{2}): \S/;
const LOCKFILE = /(^|\/)(package-lock\.json|npm-shrinkwrap\.json|[^/]*\.lock)$/;

const toPosix = (value: string) => value.split(path.sep).join('/');

const repoRoot = path.join(import.meta.dirname, '..');
const gateFilePrefix = toPosix(
  path.relative(repoRoot, import.meta.filename),
).replace(/\.ts$/, '');

function scannedFiles(): string[] {
  return execFileSync('git', ['ls-files', '-z'], { cwd: repoRoot })
    .toString('utf8')
    .split('\0')
    .filter(
      (file) =>
        file !== '' && !file.startsWith(gateFilePrefix) && !LOCKFILE.test(file),
    );
}

function readTextFile(file: string): string | null {
  const contents = readFileSync(path.join(repoRoot, file));
  return contents.includes(0) ? null : contents.toString('utf8');
}

function parseIsoDate(value: string): Date | null {
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().startsWith(value) ? parsed : null;
}

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

function problemAt(line: string, index: number, today: Date): string | null {
  const match = TODO_FORMAT.exec(line.slice(index));
  if (match === null) return `off-format, expected: ${FORMAT}`;

  const [, expiryText] = match;
  const expiry = parseIsoDate(expiryText);
  if (expiry === null) return `expiry ${expiryText} is not a real date`;

  const daysAhead = (expiry.getTime() - today.getTime()) / MS_PER_DAY;
  if (daysAhead < 0) return `expiry ${expiryText} has passed`;
  if (daysAhead > MAX_DAYS_AHEAD) {
    return `expiry ${expiryText} is more than ${MAX_DAYS_AHEAD} days out`;
  }
  return null;
}

export function lineProblems(line: string, today: Date): string[] {
  return [...line.matchAll(TODO_WORD)]
    .map((match) => problemAt(line, match.index, today))
    .filter((problem): problem is string => problem !== null);
}

export function rottenTodos(): string[] {
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
