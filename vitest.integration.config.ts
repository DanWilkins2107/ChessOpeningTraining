import { execSync } from 'node:child_process';
import { configDefaults, defineConfig } from 'vitest/config';
import web from './web/vite.config.ts';

const stack = JSON.parse(
  execSync('supabase status -o json', { encoding: 'utf8' }),
);

export default defineConfig({
  ...web,
  test: {
    ...web.test,
    include: ['src/**/*.integration.test.tsx'],
    exclude: configDefaults.exclude,
    env: {
      VITE_SUPABASE_URL: stack.API_URL,
      VITE_SUPABASE_ANON_KEY: stack.ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: stack.SERVICE_ROLE_KEY,
    },
  },
});
