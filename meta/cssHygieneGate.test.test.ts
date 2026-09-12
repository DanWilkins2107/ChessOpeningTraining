import { describe, expect, it } from 'vitest';
import {
  cssProblems,
  declaredClassNames,
  type SourceFile,
} from './cssHygieneGate';

const ENTRY = 'src/main.tsx';

const entry = (text: string): SourceFile => ({ path: ENTRY, text });
const file = (path: string, text: string): SourceFile => ({ path, text });

const problems = (...files: SourceFile[]) => cssProblems(files, ENTRY);

describe('css hygiene gate stylesheet imports', () => {
  it('accepts a module importing its own sibling stylesheet', () => {
    expect(
      problems(
        file('src/routes/Home.tsx', "import './Home.css';\n<p class='a' />"),
        file('src/routes/Home.css', '.a { color: red; }'),
      ),
    ).toEqual([]);
  });

  it('rejects a module importing a stylesheet that is not its sibling', () => {
    expect(
      problems(file('src/routes/Home.tsx', "import '../theme.css';")),
    ).toEqual([
      'src/routes/Home.tsx: imports ../theme.css, only its sibling ./Home.css is allowed',
    ]);
  });

  it('rejects a sibling stylesheet reached by a longer path', () => {
    expect(
      problems(file('src/routes/Home.tsx', "import './../routes/Home.css';")),
    ).toHaveLength(1);
  });

  it('accepts one global stylesheet at the app entry', () => {
    expect(
      problems(
        entry("import './theme.css';"),
        file('src/theme.css', ':root { --gap: 1px; }'),
      ),
    ).toEqual([]);
  });

  it('rejects a second stylesheet at the app entry', () => {
    expect(
      problems(entry("import './theme.css';\nimport './extra.css';")),
    ).toEqual([
      'src/main.tsx: app entry imports 2 stylesheets, expected at most one global stylesheet',
    ]);
  });
});

describe('css hygiene gate dead classes', () => {
  it('rejects a class declared but never used by the sibling module', () => {
    expect(
      problems(
        file('src/routes/Home.tsx', "import './Home.css';\n<p class='a' />"),
        file('src/routes/Home.css', '.a { color: red; }\n.b { color: blue; }'),
      ),
    ).toEqual([
      'src/routes/Home.css: class "b" is not used in src/routes/Home.tsx',
    ]);
  });

  it('matches whole classnames only', () => {
    expect(
      problems(
        file('src/routes/Home.tsx', "const boardSquare = 'board-square';"),
        file('src/routes/Home.css', '.board { color: red; }'),
      ),
    ).toHaveLength(1);
  });

  it('rejects a stylesheet with no sibling module', () => {
    expect(
      problems(file('src/routes/orphan.css', '.a { color: red; }')),
    ).toEqual([
      'src/routes/orphan.css: no sibling module, so nothing may import it',
    ]);
  });

  it('accepts the global stylesheet having no sibling module', () => {
    expect(
      problems(
        entry("import './theme.css';"),
        file('src/theme.css', '.page { color: red; }'),
      ),
    ).toEqual([]);
  });

  it('pairs a stylesheet with a .ts sibling as well as a .tsx one', () => {
    expect(
      problems(
        file('src/styles.ts', "export const a = 'a';"),
        file('src/styles.css', '.a { color: red; }'),
      ),
    ).toEqual([]);
  });
});

describe('css hygiene gate selector parsing', () => {
  it('collects classnames from plain, grouped and nested selectors', () => {
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

  it('ignores :root, custom properties, elements, attributes and keyframes', () => {
    const css = `
      /* .commented */
      @import './theme.css';
      :root { --board-light: #eee; }
      h1[data-active='true'] > span { color: var(--board-light); }
      @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
    `;

    expect(declaredClassNames(css)).toEqual([]);
  });

  it('ignores dotted values inside declaration bodies', () => {
    expect(declaredClassNames('.board { background: url(a.png); }')).toEqual([
      'board',
    ]);
  });
});
