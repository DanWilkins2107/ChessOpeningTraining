import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { registerTestUser } from './tests-shared/testUser';
import { router } from './router';
import { supabase } from './supabase';

const { signIn } = registerTestUser();

afterEach(cleanup);

function renderAt(...entries: string[]) {
  const memoryRouter = createMemoryRouter(router.routes, {
    initialEntries: entries,
  });
  render(<RouterProvider router={memoryRouter} />);
  return memoryRouter;
}

// supabase-js emits each subscription's first event in subscription order, so
// this one's arrives after the page's.
const authSettled = () =>
  act(
    () =>
      new Promise<void>((resolve) => {
        const { data } = supabase.auth.onAuthStateChange((event) => {
          if (event !== 'INITIAL_SESSION') return;
          data.subscription.unsubscribe();
          resolve();
        });
      }),
  );

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

it('shows the not-found page for an unknown path', () => {
  // Given the router

  // When it renders an unknown path
  renderAt('/no-such-page');

  // Then it shows not found
  expect(
    screen.getByRole('heading', { name: 'Page not found' }),
  ).toBeInTheDocument();
});
