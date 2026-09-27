import { describe, expect, it } from 'vitest';
import { duplicateDeclarations } from './duplicateHelperGate';

describe('duplicateDeclarations', () => {
  it('rejects a name declared in two files, naming every file', () => {
    expect(
      duplicateDeclarations({
        'web/src/pages/Home/page.test.tsx': 'const renderAt = () => {};',
        'web/src/tests-shared/renderAt.ts': 'export function renderAt() {}',
        'supabase/tests/studies.integration.test.ts': 'const renderAt = 1;',
      }),
    ).toEqual([
      'renderAt: declared in web/src/pages/Home/page.test.tsx, web/src/tests-shared/renderAt.ts, supabase/tests/studies.integration.test.ts',
    ]);
  });

  it('accepts a name declared twice within one file', () => {
    expect(
      duplicateDeclarations({ 'a.test.ts': 'const x = 1;\nconst x = 2;' }),
    ).toEqual([]);
  });

  it('accepts a different name in each file', () => {
    expect(
      duplicateDeclarations({
        'a.test.ts': 'const first = 1;',
        'b.test.ts': 'const second = 1;',
      }),
    ).toEqual([]);
  });

  const declarations = [
    'const shared = 1;',
    'let shared = 1;',
    'var shared = 1;',
    'function shared() {}',
    'async function shared() {}',
    'class shared {}',
    'export const shared = 1;',
    'export async function shared() {}',
    'export class shared {}',
  ];

  it.each(declarations)('spots %s', (declaration) => {
    expect(
      duplicateDeclarations({
        'a.test.ts': declaration,
        'b.test.ts': 'const shared = 1;',
      }),
    ).toEqual(['shared: declared in a.test.ts, b.test.ts']);
  });

  const nonDeclarations = [
    '  const shared = 1;',
    "import { shared } from './helpers';",
    'export { shared };',
    'const { shared } = wrapper;',
  ];

  it.each(nonDeclarations)('ignores %s', (line) => {
    expect(
      duplicateDeclarations({
        'a.test.ts': line,
        'b.test.ts': 'const shared = 1;',
      }),
    ).toEqual([]);
  });
});
