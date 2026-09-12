import { expect, it, vi } from 'vitest';
import { env } from './env';

const { client, createClient } = vi.hoisted(() => {
  const client = { from: () => null };
  return { client, createClient: vi.fn(() => client) };
});

vi.mock('@supabase/supabase-js', () => ({ createClient }));

it('creates one client from the validated env', async () => {
  const { supabase } = await import('./supabase');

  expect(createClient).toHaveBeenCalledExactlyOnceWith(
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_ANON_KEY,
  );
  expect(supabase).toBe(client);
});
