import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ENTRY = 'src/main.tsx';
const SCANNED = /\.(tsx?|css)$/;

const STYLESHEET_IMPORT = /import\s+(?:[^;'"]*from\s*)?['"]([^'"]+\.css)['"]/g;
const AT_STATEMENT = /@[a-z-]+[^;{}]*;/gi;
const CSS_COMMENT = /\/\*[\s\S]*?\*\//g;
const CLASS_SELECTOR = /\.(-?[A-Za-z_][A-Za-z0-9_-]*)/g;
const MODULE_EXTENSIONS = ['.tsx', '.ts'];

const repoRoot = path.join(import.meta.dirname, '..');

export type SourceFile = { path: string; text: string };

export function cssProblems(files: SourceFile[], entryPath: string): string[] {
  const byPath = new Map(files.map((file) => [file.path, file.text]));
  const globals = new Set(
    stylesheetImports(byPath.get(entryPath) ?? '').map((specifier) =>
      resolveFrom(entryPath, specifier),
    ),
  );

  return files.flatMap((file) =>
    file.path.endsWith('.css')
      ? deadClassProblems(file, byPath, globals)
      : importProblems(file, entryPath),
  );
}

export function stylesheetHygieneProblems(): string[] {
  return cssProblems(scannedFiles(), ENTRY);
}

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

function importProblems(file: SourceFile, entryPath: string): string[] {
  const imports = stylesheetImports(file.text);

  if (file.path === entryPath) {
    if (imports.length <= 1) return [];
    return [
      `${file.path}: app entry imports ${imports.length} stylesheets, expected at most one global stylesheet`,
    ];
  }

  const sibling = `./${baseName(stem(file.path))}.css`;
  return imports
    .filter((specifier) => specifier !== sibling)
    .map(
      (specifier) =>
        `${file.path}: imports ${specifier}, only its sibling ${sibling} is allowed`,
    );
}

function deadClassProblems(
  file: SourceFile,
  byPath: Map<string, string>,
  globals: Set<string>,
): string[] {
  const sibling = siblingModule(file.path, byPath);

  if (sibling === null) {
    if (globals.has(file.path)) return [];
    return [`${file.path}: no sibling module, so nothing may import it`];
  }

  return declaredClassNames(file.text)
    .filter((name) => !usesClassName(sibling.text, name))
    .map(
      (name) => `${file.path}: class "${name}" is not used in ${sibling.path}`,
    );
}

function siblingModule(
  cssPath: string,
  byPath: Map<string, string>,
): SourceFile | null {
  for (const extension of MODULE_EXTENSIONS) {
    const modulePath = stem(cssPath) + extension;
    const text = byPath.get(modulePath);
    if (text !== undefined) return { path: modulePath, text };
  }
  return null;
}

function stylesheetImports(source: string): string[] {
  return [...source.matchAll(STYLESHEET_IMPORT)].map((match) => match[1]);
}

export function declaredClassNames(css: string): string[] {
  const stripped = css.replace(CSS_COMMENT, '').replace(AT_STATEMENT, '');
  const names = new Set<string>();
  for (const prelude of selectorPreludes(stripped)) {
    for (const match of prelude.matchAll(CLASS_SELECTOR)) {
      names.add(match[1]);
    }
  }
  return [...names];
}

function selectorPreludes(css: string): string[] {
  const preludes: string[] = [];
  let start = 0;
  for (const brace of css.matchAll(/[{}]/g)) {
    if (brace[0] === '{') preludes.push(css.slice(start, brace.index));
    start = brace.index + 1;
  }
  return preludes;
}

function usesClassName(source: string, name: string): boolean {
  return new RegExp(`(?<![\\w-])${name}(?![\\w-])`).test(source);
}

function stem(filePath: string): string {
  return filePath.slice(0, filePath.lastIndexOf('.'));
}

function baseName(filePath: string): string {
  return filePath.slice(filePath.lastIndexOf('/') + 1);
}

function resolveFrom(fromPath: string, specifier: string): string {
  const segments = fromPath.split('/').slice(0, -1);
  for (const part of specifier.split('/')) {
    if (part !== '.') segments.push(part);
  }
  return segments.join('/');
}
