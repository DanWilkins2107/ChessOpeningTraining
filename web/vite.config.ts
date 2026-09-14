import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { csp } from './src/elements/csp.ts';

export default defineConfig({
  // Explicit so setupFiles and .env.test still resolve against web/ when this
  // config is loaded from the repo root, as Stryker does.
  root: new URL('.', import.meta.url).pathname,
  plugins: [react(), csp()],
  // Stops small assets becoming data: URIs, which the CSP blocks.
  build: { assetsInlineLimit: 0 },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    // The integration project in vitest.config.ts runs these against the test
    // stack.
    exclude: [...configDefaults.exclude, '**/*.integration.test.{ts,tsx}'],
  },
});
