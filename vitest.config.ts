import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['./web/vite.config.ts', { test: { root: './meta' } }],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json'],
      // Wider than stryker.config.json's mutate list, which covers web/src
      // only. The divergence is deliberate; see the comment there.
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
