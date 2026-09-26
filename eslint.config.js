import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['**/dist', '.stryker-tmp'] },
  {
    files: ['**/*.{js,ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
      prettier,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message:
            'dangerouslySetInnerHTML is an XSS path to the localStorage session.',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          name: 'zod',
          message:
            "Import z from web/src/z.ts, which stops zod's new Function probe that the CSP blocks.",
        },
      ],
    },
  },
  {
    files: ['web/src/z.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
);
