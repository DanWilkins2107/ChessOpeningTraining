import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/testUtils/setup.ts'],
    // tests/paletteGate.test.ts reads .css files raw; vitest stubs them empty without this.
    css: true,
  },
});
