import { createClient } from '@supabase/supabase-js';
import { fireEvent, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { submitCredentials } from '../../tests-shared/credentialsForm';
import { pathOf, renderSettledAt } from '../../tests-shared/renderAt';
import { registerTestUser } from '../../tests-shared/testUser';
import { env } from '../../env';

const { credentials, signIn } = registerTestUser();

afterEach(() => {
  vi.restoreAllMocks();
});

async function accountPage() {
  await signIn();
  return renderSettledAt('/account');
}

const pressSignOut = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

function failTheLogoutRequest() {
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
}

it('signs out this device only', async () => {
  // Given the user signed in here and on another device
  const otherDevice = createClient(
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  await signIn(otherDevice);
  await accountPage();

  // When they sign out here
  pressSignOut();

  // Then the other device stays signed in
  await screen.findByRole('status');
  const { error } = await otherDevice.auth.refreshSession();
  expect(error).toBeNull();
});

it('leaves no way back to the account page', async () => {
  // Given a signed-in user who has signed out
  const memoryRouter = await accountPage();
  pressSignOut();
  await screen.findByRole('status');

  // When they go back
  await memoryRouter.navigate(-1);

  // Then the account page is not in their history
  expect(pathOf(memoryRouter)).not.toBe('/account');
});

it('confirms a successful sign out on the sign-in page', async () => {
  // Given a signed-in user on their account page
  await accountPage();

  // When they sign out
  pressSignOut();

  // Then the sign-in page says so
  expect(await screen.findByRole('status')).toHaveTextContent(
    'Sign out successful',
  );
});

it('says a failed sign out was not confirmed by the server', async () => {
  // Given a signed-in user, and a server that fails to sign them out
  await accountPage();
  failTheLogoutRequest();

  // When they sign out
  pressSignOut();

  // Then the sign-in page says the session was only cleared here
  await vi.waitFor(() =>
    expect(screen.getByRole('status')).toHaveTextContent(
      'Signed out on this device. The server did not confirm it.',
    ),
  );
});

async function signBackIn() {
  const memoryRouter = await accountPage();
  pressSignOut();
  await screen.findByRole('status');
  submitCredentials(
    screen.getByRole('button', { name: 'Sign in' }),
    credentials,
  );
  await vi.waitFor(() => expect(pathOf(memoryRouter)).toBe('/'));
  return memoryRouter;
}

it('lets them sign straight back in', async () => {
  // Given a signed-out user looking at the sign-out notice

  // When they sign in again
  const memoryRouter = await signBackIn();

  // Then they are back in the app
  expect(pathOf(memoryRouter)).toBe('/');
});

it('leaves no way back to the sign-out notice once they sign back in', async () => {
  // Given a user who signed out and straight back in
  const memoryRouter = await signBackIn();

  // When they go back
  await memoryRouter.navigate(-1);

  // Then the stale notice is not in their history
  expect(pathOf(memoryRouter)).toBe('/');
});
