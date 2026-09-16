import { describe, expect, it } from 'vitest';
import { imports } from './tests-shared/imports';
import { singleImporterProblems, testImportProblems } from './testImportGate';

describe('testImportProblems', () => {
  it('rejects app and meta code importing a test helper or a test', () => {
    expect(
      testImportProblems({
        'web/src/pages/Home/elements/Board.tsx': imports(
          '../../../tests-shared/testUser',
          '../page.test',
        ),
        'meta/expiry.ts': imports('./todoGate.meta.test.ts'),
      }),
    ).toEqual([
      'web/src/pages/Home/elements/Board.tsx: imports web/src/tests-shared/testUser, which only tests may import',
      'web/src/pages/Home/elements/Board.tsx: imports web/src/pages/Home/page.test, which only tests may import',
      'meta/expiry.ts: imports meta/todoGate.meta.test.ts, which only tests may import',
    ]);
  });

  it('rejects app code importing from either meta folder', () => {
    expect(
      testImportProblems({
        'web/src/elements/Foo.tsx': imports(
          '../../../meta/expiry',
          '../../meta/paletteGate',
        ),
      }),
    ).toEqual([
      'web/src/elements/Foo.tsx: imports meta/expiry, which only tests may import',
      'web/src/elements/Foo.tsx: imports web/meta/paletteGate, which only tests may import',
    ]);
  });

  it('accepts meta code importing meta, and app code importing an app folder named meta', () => {
    expect(
      testImportProblems({
        'meta/todoGate.ts': imports('./expiry'),
        'web/meta/placementGate.ts': imports('../../meta/expiry'),
        'web/src/pages/Home/page.tsx': imports('../meta/Board'),
      }),
    ).toEqual([]);
  });

  it('accepts tests and test helpers importing each other and app code', () => {
    expect(
      testImportProblems({
        'web/src/pages/Home/page.tsx': imports('../../elements/Foo'),
        'web/src/tests-shared/testUser.ts': imports('../elements/Foo'),
        'web/src/tests-shared/signIn.ts': imports('./testUser'),
        'web/src/elements/Foo.test.tsx': imports(
          './Foo',
          '../tests-shared/signIn',
        ),
      }),
    ).toEqual([]);
  });
});

describe('singleImporterProblems', () => {
  it('rejects a test helper that only one file imports, however often', () => {
    expect(
      singleImporterProblems({
        'web/src/pages/Home/page.test.tsx': imports(
          './tests-shared/renderAt',
          './tests-shared/renderAt.ts',
        ),
      }),
    ).toEqual([
      'web/src/pages/Home/tests-shared/renderAt: only web/src/pages/Home/page.test.tsx imports it, so inline it',
    ]);
  });

  it('accepts a helper with two importers and a module outside tests-shared with one', () => {
    expect(
      singleImporterProblems({
        'web/src/elements/session.test.tsx': imports(
          '../tests-shared/testUser',
        ),
        'web/src/router.test.tsx': imports('./tests-shared/testUser.ts'),
        'web/src/page.tsx': imports('./elements/Foo'),
      }),
    ).toEqual([]);
  });
});
