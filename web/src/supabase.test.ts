import { expect, it, vi } from 'vitest';
import { env } from './env';

// mock-reason: the vi.mock factory below runs before this module body, so the
// stand-in client has to be built inside vi.hoisted to exist in time.
const { client, createClient } = vi.hoisted(() => {
  const client = { from: () => null };
  return { client, createClient: vi.fn(() => client) };
});

// mock-reason: the createClient call is the assertion — the contract is "one
// client, built from the validated env" — and the real one would open a client
// against a Supabase project that does not exist.
vi.mock('@supabase/supabase-js', () => ({ createClient }));

it('creates one client from the validated env', async () => {
  const { supabase } = await import('./supabase');

  expect(createClient).toHaveBeenCalledExactlyOnceWith(
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_ANON_KEY,
  );
  expect(supabase).toBe(client);
});
