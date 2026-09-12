import { describe, expect, it } from 'vitest';
import { excludeProblems, placementProblems } from './lowestCommonFolderGate';
import type { ModuleSources } from './lowestCommonFolderGate';
import { MARKER } from './todoGate';

const reason = (expiry: string) =>
  `${MARKER} 1a2b3c4d ${expiry}: moving with the analysis page`;

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
  it('accepts a live exclude on a module that is still misplaced', () => {
    expect(
      excludeProblems(
        MISPLACED,
        [],
        [{ path: 'src/elements/Foo/Foo.tsx', reason: reason('2026-09-20') }],
        TODAY,
      ),
    ).toEqual([]);
  });

  it('rejects an expired exclude', () => {
    const [problem] = excludeProblems(
      MISPLACED,
      [],
      [{ path: 'src/elements/Foo/Foo.tsx', reason: reason('2026-08-31') }],
      TODAY,
    );
    expect(problem).toContain('has passed');
  });

  it('rejects an off-format exclude', () => {
    const [problem] = excludeProblems(
      MISPLACED,
      [],
      [{ path: 'src/elements/Foo/Foo.tsx', reason: `${MARKER} soon` }],
      TODAY,
    );
    expect(problem).toContain('off-format');
  });

  it('rejects an exclude carrying no node id and expiry at all', () => {
    expect(
      excludeProblems(
        MISPLACED,
        [],
        [{ path: 'src/elements/Foo/Foo.tsx', reason: 'moving one day' }],
        TODAY,
      ),
    ).toEqual([
      `src/elements/Foo/Foo.tsx: exclude needs a ${MARKER} id and expiry`,
    ]);
  });

  it('rejects an exclude naming a module that does not exist', () => {
    expect(
      excludeProblems(
        MISPLACED,
        [],
        [{ path: 'src/elements/Gone/Gone.tsx', reason: reason('2026-09-20') }],
        TODAY,
      ),
    ).toEqual(['src/elements/Gone/Gone.tsx: exclude names no module']);
  });

  it('rejects an exclude on a module that is now correctly placed', () => {
    expect(
      excludeProblems(
        MISPLACED,
        [],
        [{ path: 'src/pages/Home/page.tsx', reason: reason('2026-09-20') }],
        TODAY,
      ),
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
