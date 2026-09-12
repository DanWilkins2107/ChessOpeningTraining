import { expect, it, vi } from 'vitest';

const { client, createClient } = vi.hoisted(() => {
  const client = { from: () => null };
  return { client, createClient: vi.fn(() => client) };
});

vi.mock('@supabase/supabase-js', () => ({ createClient }));
vi.mock('./env', () => ({
  env: {
    VITE_SUPABASE_URL: 'https://project-ref.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'anon-key',
  },
}));

it('creates one client from the validated env', async () => {
  const { supabase } = await import('./supabase');

  expect(createClient).toHaveBeenCalledExactlyOnceWith(
    'https://project-ref.supabase.co',
    'anon-key',
  );
  expect(supabase).toBe(client);
});
