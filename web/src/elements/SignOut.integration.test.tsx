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

it('renders nothing when the button is hidden', () => {
  // Given no reason to show the button

  // When it renders
  const { container } = render(<SignOut showButton={false} />);

  // Then it is empty
  expect(container).toBeEmptyDOMElement();
});

it('signs out this device only', async () => {
  // Given the user signed in here and on another device
  const otherDevice = createClient(
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  await signIn(otherDevice);
  await signIn();
  const { container, rerender } = render(<SignOut showButton />);

  // When they sign out here and the button is hidden
  await clickSignOut();
  rerender(<SignOut showButton={false} />);

  // Then this device is signed out, with no error, and the other device stays signed in
  const { data } = await supabase.auth.getSession();
  expect(data.session).toBeNull();
  expect(container).toBeEmptyDOMElement();
  const { error } = await otherDevice.auth.refreshSession();
  expect(error).toBeNull();
});

it('shows the server error once the button is hidden', async () => {
  // Given a signed-in user, and a server that fails to sign them out
  await signIn();
  const { rerender } = render(<SignOut showButton />);
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

  // When they sign out and the button is hidden
  await clickSignOut();
  rerender(<SignOut showButton={false} />);

  // Then the error shows where the button was
  expect(await screen.findByRole('alert')).toHaveTextContent('Logout failed');
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
