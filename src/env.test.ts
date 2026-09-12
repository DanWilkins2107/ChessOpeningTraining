import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it('exposes the validated supabase env vars', async () => {
  const { env } = await import('./env');

  expect(env).toEqual({
    VITE_SUPABASE_URL: 'https://project-ref.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'anon-key',
  });
});

it('fails at import time when the url is not a url', async () => {
  // mock-reason: the invalid value is the input under test, and .env.test can
  // only hold one value per variable. The anon key still comes from there, so
  // only one variable is in play.
  vi.stubEnv('VITE_SUPABASE_URL', 'project-ref.supabase.co');

  await expect(import('./env')).rejects.toThrow();
});

it('fails at import time when the anon key is empty', async () => {
  // mock-reason: the empty value is the input under test, and .env.test can
  // only hold one value per variable. The url still comes from there, so only
  // one variable is in play.
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

  await expect(import('./env')).rejects.toThrow();
});
