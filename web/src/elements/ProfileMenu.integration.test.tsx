import { createClient } from '@supabase/supabase-js';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import {
  MemoryRouter,
  RouterProvider,
  createMemoryRouter,
} from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { authSettled } from '../tests-shared/authSettled';
import { registerTestUser } from '../tests-shared/testUser';
import { env } from '../env';
import { ProfileMenu } from './ProfileMenu';
import { router } from './router';

const { signIn } = registerTestUser();

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function renderSignedIn() {
  await signIn();
  render(
    <MemoryRouter>
      <ProfileMenu />
    </MemoryRouter>,
  );
  await authSettled();
}

async function renderOpen() {
  await renderSignedIn();
  fireEvent.click(profileButton());
}

const profileButton = () => screen.getByRole('button', { name: 'Profile' });

const accountLink = () => screen.getByRole('link', { name: 'Account' });

const menu = () => screen.queryByRole('list');

it('renders nothing while the user is loading', async () => {
  // Given a signed-in user not yet loaded
  await signIn();

  // When it renders
  const { container } = render(<ProfileMenu />);

  // Then it is empty
  expect(container).toBeEmptyDOMElement();
});

it('renders nothing when signed out', async () => {
  // Given nobody is signed in

  // When it renders and the user loads
  const { container } = render(<ProfileMenu />);
  await authSettled();

  // Then it is empty
  expect(container).toBeEmptyDOMElement();
});

it('opens the menu from the profile button', async () => {
  // Given a signed-in user
  await renderSignedIn();

  // When they press the profile button
  fireEvent.click(profileButton());

  // Then the menu shows
  expect(menu()).toBeInTheDocument();
});

it('closes the menu when the profile button is pressed again', async () => {
  // Given an open menu
  await renderOpen();

  // When they press the profile button again
  fireEvent.click(profileButton());

  // Then the menu closes
  expect(menu()).not.toBeInTheDocument();
});

it('takes the user to their account page', async () => {
  // Given a signed-in user on the home page
  await signIn();
  const memoryRouter = createMemoryRouter(router.routes);
  render(<RouterProvider router={memoryRouter} />);
  await authSettled();

  // When they choose Account from the menu
  fireEvent.click(profileButton());
  fireEvent.click(accountLink());

  // Then they are on the account page
  expect(memoryRouter.state.location.pathname).toBe('/account');
});

it('closes the menu after choosing Account', async () => {
  // Given an open menu
  await renderOpen();

  // When they choose Account
  fireEvent.click(accountLink());

  // Then the menu closes
  expect(menu()).not.toBeInTheDocument();
});

it('closes the menu on Escape', async () => {
  // Given an open menu
  await renderOpen();

  // When they press Escape
  fireEvent.keyDown(document, { key: 'Escape' });

  // Then the menu closes
  expect(menu()).not.toBeInTheDocument();
});

it('returns focus to the profile button on Escape', async () => {
  // Given an open menu with focus inside it
  await renderOpen();
  accountLink().focus();

  // When they press Escape
  fireEvent.keyDown(document, { key: 'Escape' });

  // Then focus is back on the profile button
  expect(profileButton()).toHaveFocus();
});

it('keeps the menu open on other keys', async () => {
  // Given an open menu
  await renderOpen();

  // When they press another key
  fireEvent.keyDown(document, { key: 'Enter' });

  // Then the menu stays open
  expect(menu()).toBeInTheDocument();
});

it('leaves focus alone on Escape once the menu has closed', async () => {
  // Given a menu opened then closed
  await renderOpen();
  fireEvent.click(profileButton());

  // When they press Escape
  fireEvent.keyDown(document, { key: 'Escape' });

  // Then focus stays where it was
  expect(profileButton()).not.toHaveFocus();
});

it('closes the menu on a press outside it', async () => {
  // Given an open menu
  await renderOpen();

  // When they press outside it
  fireEvent.pointerDown(document.body);

  // Then the menu closes
  expect(menu()).not.toBeInTheDocument();
});

it('keeps the menu open on a press inside it', async () => {
  // Given an open menu
  await renderOpen();

  // When they press inside it
  fireEvent.pointerDown(accountLink());

  // Then the menu stays open
  expect(menu()).toBeInTheDocument();
});

it('closes the menu when focus leaves it', async () => {
  // Given an open menu with focus inside it
  await renderOpen();

  // When focus moves outside it
  fireEvent.focusOut(accountLink(), { relatedTarget: document.body });

  // Then the menu closes
  expect(menu()).not.toBeInTheDocument();
});

it('keeps the menu open when focus moves within it', async () => {
  // Given an open menu with focus inside it
  await renderOpen();

  // When focus moves to another item
  fireEvent.focusOut(accountLink(), {
    relatedTarget: screen.getByRole('button', { name: 'Sign out' }),
  });

  // Then the menu stays open
  expect(menu()).toBeInTheDocument();
});

it('signs out this device only', async () => {
  // Given the user signed in here and on another device
  const otherDevice = createClient(
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  await signIn(otherDevice);
  await renderOpen();

  // When they sign out here
  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

  // Then the menu goes, with no error, and the other device stays signed in
  await vi.waitFor(() =>
    expect(screen.queryByRole('button')).not.toBeInTheDocument(),
  );
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  const { error } = await otherDevice.auth.refreshSession();
  expect(error).toBeNull();
});

it('shows the server error where the menu was', async () => {
  // Given an open menu, and a server that fails to sign the user out
  await renderOpen();
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

  // Then the error replaces the menu
  expect(await screen.findByRole('alert')).toHaveTextContent('Logout failed');
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
