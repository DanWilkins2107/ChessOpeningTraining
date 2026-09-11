import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    // TODO 0b9bbb68 2026-10-09: point fallow's health.coverage at
    // coverage/coverage-final.json once PR #10 lands .fallowrc.json.
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json'],
    },
  },
});
