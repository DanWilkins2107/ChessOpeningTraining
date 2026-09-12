import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it('exposes the validated supabase env vars', async () => {
  vi.stubEnv('VITE_SUPABASE_URL', 'https://project-ref.supabase.co');
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key');

  const { env } = await import('./env');

  expect(env).toEqual({
    VITE_SUPABASE_URL: 'https://project-ref.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'anon-key',
  });
});

it('fails at import time when the url is not a url', async () => {
  vi.stubEnv('VITE_SUPABASE_URL', 'project-ref.supabase.co');
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key');

  await expect(import('./env')).rejects.toThrow();
});

it('fails at import time when the anon key is empty', async () => {
  vi.stubEnv('VITE_SUPABASE_URL', 'https://project-ref.supabase.co');
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

  await expect(import('./env')).rejects.toThrow();
});
