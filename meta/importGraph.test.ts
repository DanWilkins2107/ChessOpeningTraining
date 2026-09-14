import { expect, it } from 'vitest';
import { consumersByModule } from './importGraph';

it('maps each module to the files importing it, resolving extensions', () => {
  expect(
    consumersByModule({
      'web/src/elements/Foo.tsx': '',
      'web/src/elements/useBoard.ts': '',
      'web/src/theme.css': '',
      'web/src/pages/Home/page.tsx': [
        "import { Foo } from '../../elements/Foo';",
        "import '../../theme.css';",
        "const lazy = import('../../elements/useBoard.ts');",
        "import logo from '../../logo.svg';",
        "import { z } from 'zod';",
      ].join('\n'),
      'meta/gate.ts': "import { Foo } from '../web/src/elements/Foo';",
    }),
  ).toEqual({
    'web/src/elements/Foo.tsx': ['web/src/pages/Home/page.tsx', 'meta/gate.ts'],
    'web/src/theme.css': ['web/src/pages/Home/page.tsx'],
    'web/src/elements/useBoard.ts': ['web/src/pages/Home/page.tsx'],
  });
});

it('counts a file once however often it imports a module', () => {
  expect(
    consumersByModule({
      'src/tests-shared/renderAt.ts': '',
      'src/page.test.tsx': [
        "import { renderAt } from './tests-shared/renderAt';",
        "import type { Route } from './tests-shared/renderAt.ts';",
      ].join('\n'),
    }),
  ).toEqual({ 'src/tests-shared/renderAt.ts': ['src/page.test.tsx'] });
});
