import { describe, expect, it } from 'vitest';
import { excludeProblems, placementProblems } from './lowestCommonFolderGate';
import type { ModuleSources } from './lowestCommonFolderGate';

const TODAY = new Date('2026-09-01T00:00:00Z');

const imports = (...targets: string[]) =>
  targets.map((target) => `import { x } from '${target}';`).join('\n');

const MISPLACED: ModuleSources = {
  'src/elements/Foo/Foo.tsx': '',
  'src/pages/Home/page.tsx': imports('../../elements/Foo/Foo'),
};

describe('placementProblems', () => {
  it('accepts an element at the lowest common folder of two pages', () => {
    expect(
      placementProblems(
        {
          'src/elements/Foo/Foo.tsx': '',
          'src/pages/Home/page.tsx': imports('../../elements/Foo/Foo'),
          'src/pages/About/page.tsx': imports('../../elements/Foo/Foo'),
        },
        [],
      ),
    ).toEqual([]);
  });

  it('rejects an element above the only page that consumes it', () => {
    expect(placementProblems(MISPLACED, [])).toEqual([
      'src/elements/Foo/Foo.tsx: consumed from src/pages/Home, so it belongs in src/pages/Home/elements',
    ]);
  });

  it('owns a consumer sitting directly in an elements folder by its parent', () => {
    expect(
      placementProblems(
        {
          'src/pages/Home/elements/Deep/Deep.tsx': '',
          'src/elements/shell.tsx': imports('../pages/Home/elements/Deep/Deep'),
        },
        [],
      ),
    ).toEqual([
      'src/pages/Home/elements/Deep/Deep.tsx: consumed from src, so it belongs in src/elements',
    ]);
  });

  it('accepts an element nested inside the element that alone consumes it', () => {
    expect(
      placementProblems(
        {
          'src/pages/Home/elements/Foo/elements/Bar/Bar.tsx': '',
          'src/pages/Home/elements/Foo/Foo.tsx': imports('./elements/Bar/Bar'),
        },
        [],
      ),
    ).toEqual([]);
  });

  it('ignores an import of an asset the gate does not track', () => {
    expect(
      placementProblems(
        { 'src/pages/Home/page.tsx': imports('../../elements/logo.svg') },
        [],
      ),
    ).toEqual([]);
  });

  it('leaves a module with no consumers alone', () => {
    expect(placementProblems({ 'src/elements/Foo/Foo.tsx': '' }, [])).toEqual(
      [],
    );
  });

  it('resolves extensionless and stylesheet imports', () => {
    expect(
      placementProblems(
        {
          'src/elements/theme.css': '',
          'src/elements/useBoard.ts': '',
          'src/pages/Home/page.tsx': imports(
            '../../elements/theme.css',
            '../../elements/useBoard',
          ),
        },
        [],
      ),
    ).toEqual([
      'src/elements/theme.css: consumed from src/pages/Home, so it belongs in src/pages/Home/elements',
      'src/elements/useBoard.ts: consumed from src/pages/Home, so it belongs in src/pages/Home/elements',
    ]);
  });

  it('sends a shared root module into the src elements folder', () => {
    const sources = {
      'src/shared.ts': '',
      'src/pages/Home/page.tsx': imports('../../shared'),
      'src/pages/About/page.tsx': imports('../../shared'),
    };
    expect(placementProblems(sources, [])).toEqual([
      'src/shared.ts: consumed from src/pages/About, src/pages/Home, so it belongs in src/elements',
    ]);
    expect(placementProblems(sources, ['src/shared.ts'])).toEqual([]);
  });
});

describe('excludeProblems', () => {
  const exclude = (path: string, expiry = '2026-09-20') => [
    { path, expiry, reason: 'moving with the analysis page' },
  ];

  it('accepts a live exclude on a module that is still misplaced', () => {
    expect(
      excludeProblems(
        MISPLACED,
        [],
        exclude('src/elements/Foo/Foo.tsx'),
        TODAY,
      ),
    ).toEqual([]);
  });

  it('rejects an expired exclude', () => {
    expect(
      excludeProblems(
        MISPLACED,
        [],
        exclude('src/elements/Foo/Foo.tsx', '2026-08-31'),
        TODAY,
      ),
    ).toEqual(['src/elements/Foo/Foo.tsx: expiry 2026-08-31 has passed']);
  });

  it('rejects an exclude parked more than 30 days out', () => {
    expect(
      excludeProblems(
        MISPLACED,
        [],
        exclude('src/elements/Foo/Foo.tsx', '2026-10-02'),
        TODAY,
      ),
    ).toEqual([
      'src/elements/Foo/Foo.tsx: expiry 2026-10-02 is more than 30 days out',
    ]);
  });

  it.each(['2026-09-31', 'soon'])('rejects the expiry %s', (expiry) => {
    expect(
      excludeProblems(
        MISPLACED,
        [],
        exclude('src/elements/Foo/Foo.tsx', expiry),
        TODAY,
      ),
    ).toEqual([
      `src/elements/Foo/Foo.tsx: expiry ${expiry} is not a real date`,
    ]);
  });

  it('rejects an exclude naming a module that does not exist', () => {
    expect(
      excludeProblems(
        MISPLACED,
        [],
        exclude('src/elements/Gone/Gone.tsx'),
        TODAY,
      ),
    ).toEqual(['src/elements/Gone/Gone.tsx: exclude names no module']);
  });

  it('rejects an exclude on a module that is now correctly placed', () => {
    expect(
      excludeProblems(MISPLACED, [], exclude('src/pages/Home/page.tsx'), TODAY),
    ).toEqual(['src/pages/Home/page.tsx: exclude is no longer needed']);
  });

  it('rejects a root exception naming a module that does not exist', () => {
    expect(excludeProblems(MISPLACED, ['src/gone.ts'], [], TODAY)).toEqual([
      'src/gone.ts: root exception names no module',
    ]);
    expect(
      excludeProblems(MISPLACED, ['src/pages/Home/page.tsx'], [], TODAY),
    ).toEqual([]);
  });
});
