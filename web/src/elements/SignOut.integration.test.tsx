import { createClient } from '@supabase/supabase-js';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { authSettled } from '../../tests/authSettled';
import { registerTestUser } from '../../tests/testUser';
import { env } from '../env';
import { SignOut } from './SignOut';

const { signIn } = registerTestUser();

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function renderSignedIn() {
  await signIn();
  render(<SignOut />);
  await authSettled();
}

it('renders nothing while the user is loading', async () => {
  // Given a signed-in user not yet loaded
  await signIn();

  // When it renders
  const { container } = render(<SignOut />);

  // Then it is empty
  expect(container).toBeEmptyDOMElement();
});

it('renders nothing when signed out', async () => {
  // Given nobody is signed in

  // When it renders and the user loads
  const { container } = render(<SignOut />);
  await authSettled();

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
  await renderSignedIn();

  // When they sign out here
  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

  // Then the button goes, with no error, and the other device stays signed in
  await vi.waitFor(() =>
    expect(screen.queryByRole('button')).not.toBeInTheDocument(),
  );
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  const { error } = await otherDevice.auth.refreshSession();
  expect(error).toBeNull();
});

it('shows the server error where the button was', async () => {
  // Given a signed-in user, and a server that fails to sign them out
  await renderSignedIn();
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
  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

  // Then the error replaces the button
  expect(await screen.findByRole('alert')).toHaveTextContent('Logout failed');
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
