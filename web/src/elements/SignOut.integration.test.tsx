import { createClient } from '@supabase/supabase-js';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { registerTestUser } from '../tests-shared/testUser';
import { env } from '../env';
import { supabase } from '../supabase';
import { SignOut } from './SignOut';

const { signIn } = registerTestUser();

afterEach(() => {
  vi.restoreAllMocks();
});

const signedOut = () =>
  new Promise<void>((resolve) => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== 'SIGNED_OUT') return;
      data.subscription.unsubscribe();
      resolve();
    });
  });

async function clickSignOut() {
  const done = signedOut();
  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
  await act(() => done);
}

it('signs out this device only', async () => {
  // Given the user signed in here and on another device
  const otherDevice = createClient(
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  await signIn(otherDevice);
  await signIn();
  render(<SignOut />);

  // When they sign out here
  await clickSignOut();

  // Then this device is signed out and the other device stays signed in
  await vi.waitFor(async () => {
    const { data } = await supabase.auth.getSession();
    expect(data.session).toBeNull();
  });
  const { error } = await otherDevice.auth.refreshSession();
  expect(error).toBeNull();
});

it('shows the server error beside the button', async () => {
  // Given a signed-in user, and a server that fails to sign them out
  await signIn();
  render(<SignOut />);
  const realFetch = window.fetch;
  // mock-reason: the local auth server cannot be made to fail a logout on
  // demand. Only the logout request is failed; everything else is real.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) =>
    String(input).includes('/logout')
      ? Promise.resolve(
          Response.json({ msg: 'Logout failed' }, { status: 500 }),
        )
      : realFetch(input, init),
  );

  // When they sign out
  await clickSignOut();

  // Then the error shows
  expect(await screen.findByRole('alert')).toHaveTextContent('Logout failed');
});
