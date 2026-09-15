import { createClient } from '@supabase/supabase-js';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { authSettled } from '../../tests-shared/authSettled';
import { registerTestUser } from '../../tests-shared/testUser';
import { env } from '../../env';
import { router } from '../../elements/router';

const { signIn } = registerTestUser();

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function renderSignedIn() {
  await signIn();
  const memoryRouter = createMemoryRouter(router.routes, {
    initialEntries: ['/profile'],
  });
  render(<RouterProvider router={memoryRouter} />);
  await authSettled();
  return memoryRouter;
}

const pathOf = ({ state }: Awaited<ReturnType<typeof renderSignedIn>>) =>
  state.location.pathname + state.location.search;

const signOut = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

it('takes the user to their account page', async () => {
  // Given a signed-in user on their profile page
  const memoryRouter = await renderSignedIn();

  // When they choose Account
  fireEvent.click(screen.getByRole('link', { name: 'Account' }));

  // Then they are on the account page
  expect(pathOf(memoryRouter)).toBe('/account');
});

it('signs out this device only', async () => {
  // Given the user signed in here and on another device
  const otherDevice = createClient(
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  await signIn(otherDevice);
  const memoryRouter = await renderSignedIn();

  // When they sign out here
  signOut();

  // Then they are at sign in with no error, and the other device stays signed in
  await vi.waitFor(() =>
    expect(pathOf(memoryRouter)).toBe('/sign-in?next=%2Fprofile'),
  );
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  const { error } = await otherDevice.auth.refreshSession();
  expect(error).toBeNull();
});

it('shows the server error in the header', async () => {
  // Given a signed-in user on their profile page, and a server that fails to sign them out
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
  signOut();

  // Then the error replaces the profile link in the header
  const alert = await screen.findByRole('alert');
  expect(alert).toHaveTextContent('Logout failed');
  expect(screen.getByRole('banner')).toContainElement(alert);
  expect(
    screen.queryByRole('link', { name: 'Profile' }),
  ).not.toBeInTheDocument();
});
