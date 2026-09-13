import { execSync } from 'node:child_process';
import { configDefaults, defineConfig } from 'vitest/config';
import web from './web/vite.config.ts';

const testStack = JSON.parse(
  execSync('npm run -s db:test -- status -o json', { encoding: 'utf8' }),
);

export default defineConfig({
  test: {
    projects: [
      './web/vite.config.ts',
      {
        ...web,
        test: {
          ...web.test,
          name: 'integration',
          include: ['src/**/*.integration.test.{ts,tsx}'],
          exclude: configDefaults.exclude,
          env: {
            VITE_SUPABASE_URL: testStack.API_URL,
            VITE_SUPABASE_ANON_KEY: testStack.ANON_KEY,
            SUPABASE_SERVICE_ROLE_KEY: testStack.SERVICE_ROLE_KEY,
          },
        },
      },
      { test: { root: './meta' } },
    ],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json'],
      include: ['meta/**/*.ts', 'web/meta/**/*.ts', 'web/src/**/*.{ts,tsx}'],
      exclude: ['**/*.test.{ts,tsx}'],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
