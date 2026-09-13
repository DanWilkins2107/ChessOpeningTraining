import { describe, expect, it } from 'vitest';
import { testImportProblems } from './testImportGate';

const imports = (...targets: string[]) =>
  targets.map((target) => `import { x } from '${target}';`).join('\n');

describe('testImportProblems', () => {
  it('rejects app code importing a test helper or a test', () => {
    expect(
      testImportProblems({
        'src/tests-shared/testUser.ts': '',
        'src/pages/Home/page.test.tsx': '',
        'src/pages/Home/elements/Board.tsx': imports(
          '../../../tests-shared/testUser',
          '../page.test',
        ),
      }),
    ).toEqual([
      'src/pages/Home/elements/Board.tsx: imports src/tests-shared/testUser.ts, which only tests may import',
      'src/pages/Home/elements/Board.tsx: imports src/pages/Home/page.test.tsx, which only tests may import',
    ]);
  });

  it('accepts tests and test helpers importing each other and app code', () => {
    expect(
      testImportProblems({
        'src/elements/Foo.tsx': '',
        'src/pages/Home/page.tsx': imports('../../elements/Foo'),
        'src/tests-shared/testUser.ts': imports('../elements/Foo'),
        'src/tests-shared/signIn.ts': imports('./testUser'),
        'src/elements/Foo.test.tsx': imports('./Foo', '../tests-shared/signIn'),
      }),
    ).toEqual([]);
  });
});
