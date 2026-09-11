import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { colourLiteralsIn } from './paletteGate';

const THEME = 'src/theme.css';
const SCANNED_EXTENSIONS = ['.css', '.ts', '.tsx'];

const toPosix = (value: string) => value.split(path.sep).join('/');

const repoRoot = path.join(import.meta.dirname, '..');
const srcDir = path.join(repoRoot, 'src');

describe('palette gate', () => {
  it('finds colour literals only in theme.css', () => {
    expect(strayColourLiterals()).toEqual([]);
  });
});

function strayColourLiterals(): string[] {
  return scannedFiles()
    .filter((file) => file !== THEME)
    .flatMap((file) =>
      colourLiteralsIn(file, readTextFile(file)).map(
        (literal) => `${file}: ${literal.trim()}`,
      ),
    );
}

function scannedFiles(): string[] {
  return readdirSync(srcDir, { recursive: true, withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() && SCANNED_EXTENSIONS.includes(path.extname(entry.name)),
    )
    .map((entry) =>
      toPosix(path.relative(repoRoot, path.join(entry.parentPath, entry.name))),
    );
}

function readTextFile(file: string): string {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}
