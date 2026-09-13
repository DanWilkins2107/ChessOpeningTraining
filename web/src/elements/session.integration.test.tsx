import { createClient } from '@supabase/supabase-js';
import { act, cleanup, render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  expect,
  it,
  vi,
} from 'vitest';
import { env } from '../env';

const admin = createClient(
  env.VITE_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const credentials = {
  email: `session-${crypto.randomUUID()}@example.test`,
  password: crypto.randomUUID(),
};

let userId: string;

beforeAll(async () => {
  const { data, error } = await admin.auth.admin.createUser({
    ...credentials,
    email_confirm: true,
  });
  if (error) throw error;
  userId = data.user.id;
});

afterAll(async () => {
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw error;
});

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
});

afterEach(cleanup);

async function renderUser() {
  const { useUser } = await import('./session');
  const { supabase } = await import('../supabase');

  function UserId() {
    return useUser()?.id ?? 'signed out';
  }

  await act(async () =>
    render(
      <Suspense fallback="Loading…">
        <UserId />
      </Suspense>,
    ),
  );
  return supabase;
}

it('shows the user once they sign in, and null once they sign out', async () => {
  const supabase = await renderUser();
  expect(await screen.findByText('signed out')).toBeInTheDocument();

  await act(() => supabase.auth.signInWithPassword(credentials));
  expect(await screen.findByText(userId)).toBeInTheDocument();

  await act(() => supabase.auth.signOut());
  expect(await screen.findByText('signed out')).toBeInTheDocument();
});

it('reads a signed-in session back from storage on a fresh load', async () => {
  const { supabase: firstLoad } = await import('../supabase');
  const { error } = await firstLoad.auth.signInWithPassword(credentials);
  if (error) throw error;
  vi.resetModules();

  const supabase = await renderUser();
  expect(await screen.findByText(userId)).toBeInTheDocument();

  await act(() => supabase.auth.signOut());
});
