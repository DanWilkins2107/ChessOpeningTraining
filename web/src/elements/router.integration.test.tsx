import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
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

it('sends a signed-out visitor from the account page to sign in', async () => {
  // Given a signed-out visitor

  // When they open the account page
  const memoryRouter = renderAt('/account');
  await authSettled();

  // Then they are at sign in, carrying the account path
  expect(pathOf(memoryRouter)).toBe('/sign-in?next=%2Faccount');
});

it('sends a signed-out visitor from the profile page to sign in', async () => {
  // Given a signed-out visitor

  // When they open the profile page
  const memoryRouter = renderAt('/profile');
  await authSettled();

  // Then they are at sign in, carrying the profile path
  expect(pathOf(memoryRouter)).toBe('/sign-in?next=%2Fprofile');
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
