import { createClient } from '@supabase/supabase-js';
import { act, cleanup, render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest';
import { env } from '../env';
import { supabase } from '../supabase';
import { readUser, useUser } from './session';

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

afterEach(async () => {
  cleanup();
  vi.restoreAllMocks();
  await supabase.auth.signOut({ scope: 'local' });
});

function UserId({ useUserUnderTest }: { useUserUnderTest: typeof useUser }) {
  const user = useUserUnderTest();
  return user === null ? 'signed out' : user.id;
}

const renderUserTestingHarness = (useUserUnderTest = useUser) =>
  act(async () =>
    render(
      <Suspense fallback="Loading…">
        <UserId useUserUnderTest={useUserUnderTest} />
      </Suspense>,
    ),
  );

async function signIn() {
  const { error } = await supabase.auth.signInWithPassword(credentials);
  if (error) throw error;
}

function expireStoredSession() {
  const key = localStorage.key(0) ?? '';
  const session = JSON.parse(localStorage.getItem(key) ?? '');
  localStorage.setItem(
    key,
    JSON.stringify({ ...session, expires_at: 1, refresh_token: 'revoked' }),
  );
}

it('shows loading while the startup read is still in flight', async () => {
  // Given the app loading while the startup read is still in flight
  vi.resetModules();
  const loading = await import('../supabase');
  // mock-reason: the startup read runs once, when session.ts loads, and has
  // finished before any test can render it. Holding getSession open on a
  // freshly loaded client is the only way to see it pending; the fresh modules
  // and the spy stay local to this test.
  vi.spyOn(loading.supabase.auth, 'getSession').mockReturnValue(
    new Promise(() => {}),
  );
  const { useUser: useLoadingUser } = await import('./session');

  // When the harness renders
  await renderUserTestingHarness(useLoadingUser);

  // Then it shows loading
  expect(screen.getByText('Loading…')).toBeInTheDocument();
});

it('reads an empty session store at startup as signed out', async () => {
  // Given nothing was stored when the app loaded

  // When the harness renders
  await renderUserTestingHarness();

  // Then it shows signed out
  expect(await screen.findByText('signed out')).toBeInTheDocument();
});

it('reads a stored session back as its user', async () => {
  // Given a signed-in session in storage
  await signIn();

  // When the user is read
  const user = await readUser();

  // Then it is that user
  expect(user?.id).toBe(userId);
});

it('fails the read when the stored session cannot be refreshed', async () => {
  // Given a stored session that has expired, with a revoked refresh token
  await signIn();
  expireStoredSession();

  // When the user is read
  const userRead = readUser();

  // Then the read fails rather than reporting signed out
  await expect(userRead).rejects.toThrow('Refresh token is not valid');
});

it('shows the user once they sign in', async () => {
  // Given a signed-out user on screen
  await renderUserTestingHarness();
  await screen.findByText('signed out');

  // When they sign in
  await act(signIn);

  // Then it shows them
  expect(await screen.findByText(userId)).toBeInTheDocument();
});

it('shows signed out once they sign out', async () => {
  // Given a signed-in user on screen
  await signIn();
  await renderUserTestingHarness();
  await screen.findByText(userId);

  // When they sign out
  await act(() => supabase.auth.signOut());

  // Then it shows signed out
  expect(await screen.findByText('signed out')).toBeInTheDocument();
});

it('does not subscribe to auth changes again when it rerenders', async () => {
  // Given a signed-out user on screen

  // mock-reason: the subscription count is the assertion, and supabase-js has
  // no public way to count listeners. The spy still calls the real client.
  const subscribe = vi.spyOn(supabase.auth, 'onAuthStateChange');
  await renderUserTestingHarness();
  await screen.findByText('signed out');

  // When signing in rerenders it
  await act(signIn);
  await screen.findByText(userId);

  // Then it is still the one subscription
  expect(subscribe).toHaveBeenCalledOnce();
});

it('unsubscribes from auth changes on unmount', async () => {
  // Given the harness on screen, subscribed to auth changes

  // mock-reason: the subscription is the thing under test, and supabase-js has
  // no public way to see it. The spies still call the real client.
  const subscribe = vi.spyOn(supabase.auth, 'onAuthStateChange');
  const { unmount } = await renderUserTestingHarness();
  await screen.findByText('signed out');
  const { subscription } = subscribe.mock.results[0].value.data;
  // mock-reason: as above, for the subscription's unsubscribe.
  const unsubscribe = vi.spyOn(subscription, 'unsubscribe');

  // When it unmounts
  unmount();

  // Then it unsubscribes
  expect(unsubscribe).toHaveBeenCalledOnce();
});
