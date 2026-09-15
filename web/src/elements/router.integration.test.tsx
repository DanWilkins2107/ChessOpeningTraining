import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { authSettled } from '../tests-shared/authSettled';
import { registerTestUser } from '../tests-shared/testUser';
import { router } from './router';

const { signIn } = registerTestUser();

afterEach(cleanup);

function renderAt(...entries: string[]) {
  const memoryRouter = createMemoryRouter(router.routes, {
    initialEntries: entries,
  });
  render(<RouterProvider router={memoryRouter} />);
  return memoryRouter;
}

const pathOf = ({ state }: ReturnType<typeof renderAt>) =>
  state.location.pathname + state.location.search;

it('wraps pages in the root layout', () => {
  // Given the router

  // When it renders /
  renderAt('/');

  // Then the header is there
  expect(screen.getByRole('banner')).toBeInTheDocument();
});

it('shows a protected page while the user is still loading', () => {
  // Given the user not yet loaded

  // When the router renders the home page
  renderAt('/');

  // Then it shows the page
  expect(
    screen.getByRole('heading', { name: 'Chess Opening Training' }),
  ).toBeInTheDocument();
});

it('shows a protected page to a signed-in user', async () => {
  // Given a signed-in user
  await signIn();

  // When the router renders the home page and the user loads
  renderAt('/');
  await authSettled();

  // Then it shows the page
  expect(
    screen.getByRole('heading', { name: 'Chess Opening Training' }),
  ).toBeInTheDocument();
});

it('shows the account page to a signed-in user', async () => {
  // Given a signed-in user
  await signIn();

  // When the router renders the account page and the user loads
  renderAt('/account');
  await authSettled();

  // Then it shows the account page
  expect(screen.getByRole('heading', { name: 'Account' })).toBeInTheDocument();
});

it('opens studies from the header link for a signed-in user', async () => {
  // Given a signed-in user on the home page
  await signIn();
  const memoryRouter = renderAt('/');
  await authSettled();

  // When they follow the Studies link
  fireEvent.click(screen.getByRole('link', { name: 'Studies' }));

  // Then they are on the studies page
  expect(pathOf(memoryRouter)).toBe('/studies');
  expect(screen.getByRole('heading', { name: 'Studies' })).toBeInTheDocument();
});

it('shows the header links on a protected page while the user is loading', () => {
  // Given the user not yet loaded

  // When the router renders a protected page
  renderAt('/studies');

  // Then the header links show straight away
  expect(screen.getByRole('link', { name: 'Studies' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
});

it('holds the header links on a public page until the user loads', async () => {
  // Given a signed-in user not yet loaded
  await signIn();

  // When the router renders a public page
  renderAt('/no-such-page');

  // Then the header has no links yet
  expect(
    screen.queryByRole('link', { name: 'Studies' }),
  ).not.toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('shows the header links on a public page to a signed-in user', async () => {
  // Given a signed-in user
  await signIn();

  // When they open a public page and the user loads
  renderAt('/no-such-page');
  await authSettled();

  // Then the header has its links
  expect(screen.getByRole('link', { name: 'Studies' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
});

it('hides the header links from a signed-out visitor', async () => {
  // Given a signed-out visitor

  // When they open a public page and the user loads
  renderAt('/no-such-page');
  await authSettled();

  // Then the header has no links
  expect(
    screen.queryByRole('link', { name: 'Studies' }),
  ).not.toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('takes a user who signs out to sign in, without the header links', async () => {
  // Given a signed-in user on a protected page
  await signIn();
  const memoryRouter = renderAt('/studies');
  await authSettled();

  // When they sign out
  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

  // Then they are at sign in, and the header links are gone
  await vi.waitFor(() => {
    expect(pathOf(memoryRouter)).toBe('/sign-in?next=%2Fstudies');
    expect(
      screen.queryByRole('link', { name: 'Studies' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Sign out' }),
    ).not.toBeInTheDocument();
  });
});

it('sends a signed-out visitor from the account page to sign in', async () => {
  // Given a signed-out visitor

  // When they open the account page
  const memoryRouter = renderAt('/account');
  await authSettled();

  // Then they are at sign in, carrying the account path
  expect(pathOf(memoryRouter)).toBe('/sign-in?next=%2Faccount');
});

it('sends a signed-out visitor to sign in with their path and query', async () => {
  // Given a signed-out visitor

  // When they open a protected page with a query
  const memoryRouter = renderAt('/?study=ab12');
  await authSettled();

  // Then they are at sign in, carrying the path and query
  expect(pathOf(memoryRouter)).toBe('/sign-in?next=%2F%3Fstudy%3Dab12');
});

it('leaves the protected page out of history when redirecting', async () => {
  // Given a signed-out visitor redirected from a protected page
  const memoryRouter = renderAt('/elsewhere', '/');
  await authSettled();

  // When they go back
  await act(() => memoryRouter.navigate(-1));

  // Then they land where they were before it
  expect(pathOf(memoryRouter)).toBe('/elsewhere');
});

it('keeps unknown paths public for signed-out visitors', async () => {
  // Given a signed-out visitor

  // When they open an unknown path
  const memoryRouter = renderAt('/no-such-page');
  await authSettled();

  // Then they stay on it
  expect(pathOf(memoryRouter)).toBe('/no-such-page');
});

it('keeps sign in public for signed-out visitors', async () => {
  // Given a signed-out visitor

  // When they open sign in
  const memoryRouter = renderAt('/sign-in');
  await authSettled();

  // Then they stay on it
  expect(pathOf(memoryRouter)).toBe('/sign-in');
  expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
});

it('shows the not-found page for an unknown path', () => {
  // Given the router

  // When it renders an unknown path
  renderAt('/no-such-page');

  // Then it shows not found
  expect(
    screen.getByRole('heading', { name: 'Page not found' }),
  ).toBeInTheDocument();
});
