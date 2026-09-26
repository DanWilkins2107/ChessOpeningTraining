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
  it('accepts a module shared by two pages at their lowest common folder', () => {
    expect(
      placementProblems(
        {
          'src/shared/Foo/Foo.tsx': '',
          'src/pages/Home/page.tsx': imports('../../shared/Foo/Foo'),
          'src/pages/About/page.tsx': imports('../../shared/Foo/Foo'),
        },
        [],
      ),
    ).toEqual([]);
  });

  it('rejects an element consumed by two owners', () => {
    expect(
      placementProblems(
        {
          'src/elements/Foo/Foo.tsx': '',
          'src/pages/Home/page.tsx': imports('../../elements/Foo/Foo'),
          'src/elements/Bar/Bar.tsx': imports('../Foo/Foo'),
        },
        [],
      ),
    ).toEqual([
      'src/elements/Foo: consumed from src, src/pages/Home, so it belongs in src/shared',
    ]);
  });

  it('rejects an element above the only page that consumes it', () => {
    expect(placementProblems(MISPLACED, [])).toEqual([
      'src/elements/Foo: consumed from src/pages/Home, so it belongs in src/pages/Home/elements',
    ]);
  });

  it('rejects a shared module with a single owner', () => {
    expect(
      placementProblems(
        {
          'src/shared/Foo/Foo.tsx': '',
          'src/pages/Home/page.tsx': imports('../../shared/Foo/Foo'),
          'src/pages/Home/elements/Bar/Bar.tsx': imports(
            '../../../../shared/Foo/Foo',
          ),
        },
        [],
      ),
    ).toEqual([
      'src/shared/Foo: consumed from src/pages/Home, so it belongs in src/pages/Home/elements',
    ]);
  });

  it('owns a consumer in a module folder by the folder above elements', () => {
    expect(
      placementProblems(
        {
          'src/pages/Home/elements/Deep/Deep.tsx': '',
          'src/elements/Shell/Shell.tsx': imports(
            '../../pages/Home/elements/Deep/Deep',
          ),
        },
        [],
      ),
    ).toEqual([
      'src/pages/Home/elements/Deep: consumed from src, so it belongs in src/elements',
    ]);
  });

  it('does not treat a module folder as an owner', () => {
    expect(
      placementProblems(
        {
          'src/pages/Home/elements/Foo/elements/Bar/Bar.tsx': '',
          'src/pages/Home/elements/Foo/Foo.tsx': imports('./elements/Bar/Bar'),
          'src/pages/Home/elements/Baz/Baz.tsx': '',
          'src/pages/Home/elements/Qux/Qux.tsx': imports('../Baz/Baz'),
        },
        [],
      ),
    ).toEqual([
      'src/pages/Home/elements/Foo/elements/Bar: consumed from src/pages/Home, so it belongs in src/pages/Home/elements',
    ]);
  });

  it('places a module folder by consumers of any of its files but its own', () => {
    expect(
      placementProblems(
        {
          'src/elements/Foo/Foo.tsx': imports('./Foo.css', './Foo.constants'),
          'src/elements/Foo/Foo.css': '',
          'src/elements/Foo/Foo.constants.ts': '',
          'src/pages/Home/page.tsx': imports('../../elements/Foo/Foo'),
          'src/pages/About/page.tsx': imports(
            '../../elements/Foo/Foo.constants',
          ),
        },
        [],
      ),
    ).toEqual([
      'src/elements/Foo: consumed from src/pages/About, src/pages/Home, so it belongs in src/shared',
    ]);
  });

  it('ignores an import of an asset the gate does not track', () => {
    expect(
      placementProblems(
        { 'src/pages/Home/page.tsx': imports('../../elements/logo/logo.png') },
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
          'src/elements/Theme/Theme.css': '',
          'src/elements/useBoard/useBoard.ts': '',
          'src/pages/Home/page.tsx': imports(
            '../../elements/Theme/Theme.css',
            '../../elements/useBoard/useBoard',
          ),
        },
        [],
      ),
    ).toEqual([
      'src/elements/Theme: consumed from src/pages/Home, so it belongs in src/pages/Home/elements',
      'src/elements/useBoard: consumed from src/pages/Home, so it belongs in src/pages/Home/elements',
    ]);
  });

  it('places an svg by the importers of its module folder', () => {
    expect(
      placementProblems(
        {
          'src/elements/pieces/wK.svg': '<svg />',
          'src/pages/Home/page.tsx': imports('../../elements/pieces/wK.svg'),
        },
        [],
      ),
    ).toEqual([
      'src/elements/pieces: consumed from src/pages/Home, so it belongs in src/pages/Home/elements',
    ]);
  });

  it('sends a root module shared by two pages into the src shared folder', () => {
    const sources = {
      'src/common.ts': '',
      'src/pages/Home/page.tsx': imports('../../common'),
      'src/pages/About/page.tsx': imports('../../common'),
    };
    expect(placementProblems(sources, [])).toEqual([
      'src/common.ts: consumed from src/pages/About, src/pages/Home, so it belongs in src/shared',
    ]);
    expect(placementProblems(sources, ['src/common.ts'])).toEqual([]);
  });

  it('accepts a test helper at the lowest common folder of its tests', () => {
    expect(
      placementProblems(
        {
          'src/tests-shared/testUser.ts': '',
          'src/elements/session/session.integration.test.tsx': imports(
            '../../tests-shared/testUser',
          ),
          'src/router.integration.test.tsx': imports('./tests-shared/testUser'),
        },
        [],
      ),
    ).toEqual([]);
  });

  it('rejects test helpers above the only tests and helpers using them', () => {
    expect(
      placementProblems(
        {
          'src/tests-shared/renderAt.ts': '',
          'src/tests-shared/signIn.ts': '',
          'src/pages/Home/page.test.tsx': imports(
            '../../tests-shared/renderAt',
          ),
          'src/pages/Home/tests-shared/board.ts': imports(
            '../../../tests-shared/signIn',
          ),
        },
        [],
      ),
    ).toEqual([
      'src/tests-shared/renderAt.ts: consumed from src/pages/Home, so it belongs in src/pages/Home/tests-shared',
      'src/tests-shared/signIn.ts: consumed from src/pages/Home, so it belongs in src/pages/Home/tests-shared',
    ]);
  });

  it('places elements by app code alone and test helpers by tests alone', () => {
    expect(
      placementProblems(
        {
          'src/elements/Foo/Foo.tsx': '',
          'src/pages/Home/tests-shared/renderAt.ts': imports(
            '../../../elements/Foo/Foo',
          ),
          'src/pages/Home/page.test.tsx': imports('../../elements/Foo/Foo'),
          'src/tests-shared/testUser.ts': '',
          'src/pages/Home/page.tsx': imports('../../tests-shared/testUser'),
        },
        [],
      ),
    ).toEqual([]);
  });
});

describe('excludeProblems', () => {
  const exclude = (path: string, expiry = '2026-09-20') => [
    { path, expiry, reason: 'moving with the analysis page' },
  ];

  it('accepts a live exclude on a module folder that is still misplaced', () => {
    expect(
      excludeProblems(MISPLACED, [], exclude('src/elements/Foo'), TODAY),
    ).toEqual([]);
  });

  it('rejects an expired exclude', () => {
    expect(
      excludeProblems(
        MISPLACED,
        [],
        exclude('src/elements/Foo', '2026-08-31'),
        TODAY,
      ),
    ).toEqual(['src/elements/Foo: expiry 2026-08-31 has passed']);
  });

  it('rejects an exclude parked more than 30 days out', () => {
    expect(
      excludeProblems(
        MISPLACED,
        [],
        exclude('src/elements/Foo', '2026-10-02'),
        TODAY,
      ),
    ).toEqual(['src/elements/Foo: expiry 2026-10-02 is more than 30 days out']);
  });

  it.each(['2026-09-31', 'soon'])('rejects the expiry %s', (expiry) => {
    expect(
      excludeProblems(
        MISPLACED,
        [],
        exclude('src/elements/Foo', expiry),
        TODAY,
      ),
    ).toEqual([`src/elements/Foo: expiry ${expiry} is not a real date`]);
  });

  it('rejects an exclude naming a module that does not exist', () => {
    expect(
      excludeProblems(MISPLACED, [], exclude('src/elements/Gone'), TODAY),
    ).toEqual(['src/elements/Gone: exclude names no module']);
  });

  it('rejects an exclude naming a file inside a module folder', () => {
    expect(
      excludeProblems(
        MISPLACED,
        [],
        exclude('src/elements/Foo/Foo.tsx'),
        TODAY,
      ),
    ).toEqual(['src/elements/Foo/Foo.tsx: exclude names no module']);
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
