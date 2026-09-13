import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Explicit so setupFiles and .env.test still resolve against web/ when this
  // config is loaded from the repo root, as Stryker does.
  root: new URL('.', import.meta.url).pathname,
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    // These need a running local Supabase stack: vitest.integration.config.ts
    // runs them.
    exclude: [...configDefaults.exclude, '**/*.integration.test.tsx'],
  },
});
