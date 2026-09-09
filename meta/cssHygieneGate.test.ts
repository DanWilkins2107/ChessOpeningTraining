import { existsSync, readdirSync, readFileSync } from 'node:fs';
import {
  basename,
  dirname,
  extname,
  join,
  relative,
  resolve,
  sep,
} from 'node:path';
import { describe, expect, test } from 'vitest';

const repoRoot = process.cwd();
const srcDir = join(repoRoot, 'src');
const entryModule = join(srcDir, 'main.tsx');

const STYLESHEET_IMPORT = /import\s+(?:[^;'"]*from\s*)?['"]([^'"]+\.css)['"]/g;
const AT_STATEMENT = /@[a-z-]+[^;{}]*;/gi;
const CSS_COMMENT = /\/\*[\s\S]*?\*\//g;
const CLASS_SELECTOR = /\.(-?[A-Za-z_][A-Za-z0-9_-]*)/g;

function relPath(path: string): string {
  return relative(repoRoot, path).split(sep).join('/');
}

function filesUnder(dir: string, extensions: string[]): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter(
      (entry) => entry.isFile() && extensions.includes(extname(entry.name)),
    )
    .map((entry) => join(entry.parentPath, entry.name));
}

function stylesheetImports(source: string): string[] {
  return [...source.matchAll(STYLESHEET_IMPORT)].map((match) => match[1]);
}

function selectorPreludes(css: string): string[] {
  const preludes: string[] = [];
  let start = 0;
  for (const brace of css.matchAll(/[{}]/g)) {
    if (brace[0] === '{') {
      preludes.push(css.slice(start, brace.index));
    }
    start = brace.index + 1;
  }
  return preludes;
}

function declaredClassNames(css: string): string[] {
  const selectors = selectorPreludes(
    css.replace(CSS_COMMENT, '').replace(AT_STATEMENT, ''),
  );
  const names = new Set<string>();
  for (const prelude of selectors) {
    for (const match of prelude.matchAll(CLASS_SELECTOR)) {
      names.add(match[1]);
    }
  }
  return [...names];
}

function usesClassName(source: string, name: string): boolean {
  return new RegExp(`(?<![\\w-])${name}(?![\\w-])`).test(source);
}

function importViolations(modulePath: string, source: string): string[] {
  const imports = stylesheetImports(source);
  if (modulePath === entryModule) {
    return imports.length > 1
      ? [
          `${relPath(modulePath)}: app entry imports ${imports.length} stylesheets, expected at most one global stylesheet`,
        ]
      : [];
  }

  const sibling = `./${basename(modulePath, extname(modulePath))}.css`;
  return imports
    .filter((specifier) => specifier !== sibling)
    .map(
      (specifier) =>
        `${relPath(modulePath)}: imports ${specifier}, only its sibling ${sibling} is allowed`,
    );
}

function siblingModule(cssPath: string): string | undefined {
  const stem = join(dirname(cssPath), basename(cssPath, '.css'));
  return ['.tsx', '.ts']
    .map((extension) => stem + extension)
    .find((candidate) => existsSync(candidate));
}

function globalStylesheets(): string[] {
  if (!existsSync(entryModule)) {
    return [];
  }
  return stylesheetImports(readFileSync(entryModule, 'utf8')).map((specifier) =>
    resolve(dirname(entryModule), specifier),
  );
}

function deadClassViolations(cssPath: string, globals: string[]): string[] {
  const sibling = siblingModule(cssPath);

  if (!sibling) {
    return globals.includes(cssPath)
      ? []
      : [`${relPath(cssPath)}: no sibling module, so nothing may import it`];
  }

  const source = readFileSync(sibling, 'utf8');
  return declaredClassNames(readFileSync(cssPath, 'utf8'))
    .filter((name) => !usesClassName(source, name))
    .map(
      (name) =>
        `${relPath(cssPath)}: class "${name}" is not used in ${relPath(sibling)}`,
    );
}

describe('css hygiene gate', () => {
  test('modules import only their own sibling stylesheet', () => {
    const violations = filesUnder(srcDir, ['.ts', '.tsx']).flatMap(
      (modulePath) =>
        importViolations(modulePath, readFileSync(modulePath, 'utf8')),
    );

    expect(violations).toEqual([]);
  });

  test('every declared classname is used by its sibling module', () => {
    const globals = globalStylesheets();
    const violations = filesUnder(srcDir, ['.css']).flatMap((cssPath) =>
      deadClassViolations(cssPath, globals),
    );

    expect(violations).toEqual([]);
  });
});

describe('declaredClassNames', () => {
  test('collects classnames from plain and nested selectors', () => {
    const css = `
      .board { color: red; }
      @media (min-width: 37.5em) {
        .board-square:hover, .piece { color: blue; }
      }
    `;

    expect(declaredClassNames(css).sort()).toEqual([
      'board',
      'board-square',
      'piece',
    ]);
  });

  test('ignores :root, keyframes, custom properties and element selectors', () => {
    const css = `
      /* .commented */
      @import './theme.css';
      :root { --board-light: #eee; }
      h1[data-active='true'] > span { color: var(--board-light); }
      @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
    `;

    expect(declaredClassNames(css)).toEqual([]);
  });
});

describe('importViolations', () => {
  test('allows the sibling stylesheet only', () => {
    const modulePath = join(srcDir, 'routes', 'Home.tsx');

    expect(importViolations(modulePath, "import './Home.css';")).toEqual([]);
    expect(
      importViolations(
        modulePath,
        "import '../theme.css';\nimport './Home.css';",
      ),
    ).toEqual([
      'src/routes/Home.tsx: imports ../theme.css, only its sibling ./Home.css is allowed',
    ]);
  });

  test('allows the app entry a single global stylesheet', () => {
    expect(importViolations(entryModule, "import './theme.css';")).toEqual([]);
    expect(
      importViolations(
        entryModule,
        "import './theme.css';\nimport './extra.css';",
      ),
    ).toHaveLength(1);
  });
});

describe('usesClassName', () => {
  test('matches whole classnames only', () => {
    expect(usesClassName('<div className="board" />', 'board')).toBe(true);
    expect(usesClassName('<div className="board-square" />', 'board')).toBe(
      false,
    );
    expect(usesClassName('const boardSquare = 1;', 'board')).toBe(false);
  });
});
