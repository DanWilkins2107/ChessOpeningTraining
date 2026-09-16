import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { afterEach, expect, it } from 'vitest';
import { authSettled } from '../tests-shared/authSettled';
import { registerTestUser } from '../tests-shared/testUser';
import { router } from './router';

const { signIn } = registerTestUser();

afterEach(cleanup);

function renderHome() {
  const memoryRouter = createMemoryRouter(router.routes);
  render(<RouterProvider router={memoryRouter} />);
  return memoryRouter;
}

const accountLink = () => screen.queryByRole('link', { name: 'Account' });

it('offers no account link while the user is loading', async () => {
  // Given a signed-in user not yet loaded
  await signIn();

  // When the header renders
  renderHome();

  // Then there is no account link
  expect(accountLink()).not.toBeInTheDocument();
});

it('offers no account link when signed out', async () => {
  // Given nobody is signed in

  // When the header renders and the user loads
  renderHome();
  await authSettled();

  // Then there is no account link
  expect(accountLink()).not.toBeInTheDocument();
});

it('takes a signed-in user to their account page', async () => {
  // Given a signed-in user on the home page
  await signIn();
  const memoryRouter = renderHome();
  await authSettled();

  // When they press Account in the header
  fireEvent.click(screen.getByRole('link', { name: 'Account' }));

  // Then they are on the account page
  expect(memoryRouter.state.location.pathname).toBe('/account');
});
