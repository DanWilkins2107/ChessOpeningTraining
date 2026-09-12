import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const MARKER = 'mock-reason';

const FORMAT = `// ${MARKER}: <why the real thing can't be used>`;

const SCANNED = /\.tsx?$/;
const CALL = /\bvi\.(mock|doMock|stubEnv|stubGlobal|spyOn)\s*\(/;
const COMMENT = /^\s*\/\/\s?(.*)$/;
const REASON = new RegExp(String.raw`^${MARKER}: \S`);

const toPosix = (value: string) => value.split(path.sep).join('/');

const repoRoot = path.join(import.meta.dirname, '..');
const gateFilePrefix = toPosix(
  path.relative(repoRoot, import.meta.filename),
).replace(/\.ts$/, '');

export function unjustifiedCalls(text: string): string[] {
  const lines = text.split(/\r?\n/);

  return lines.flatMap((line, index) => {
    const call = CALL.exec(line);
    if (call === null || isJustified(lines, index)) return [];
    return [`${index + 1}: vi.${call[1]} needs "${FORMAT}" above it`];
  });
}

function isJustified(lines: string[], index: number): boolean {
  let topmost: string | null = null;

  for (let above = index - 1; above >= 0; above -= 1) {
    const comment = COMMENT.exec(lines[above]);
    if (comment === null) break;
    topmost = comment[1];
  }

  return topmost !== null && REASON.test(topmost);
}

export function unjustifiedMocks(): string[] {
  return scannedFiles().flatMap((file) =>
    unjustifiedCalls(readTextFile(file)).map((problem) => `${file}:${problem}`),
  );
}

function scannedFiles(): string[] {
  return execFileSync('git', ['ls-files', '-z'], { cwd: repoRoot })
    .toString('utf8')
    .split('\0')
    .filter((file) => SCANNED.test(file) && !file.startsWith(gateFilePrefix));
}

function readTextFile(file: string): string {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}
