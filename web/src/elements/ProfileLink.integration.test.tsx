import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { afterEach, expect, it } from 'vitest';
import { authSettled } from '../tests-shared/authSettled';
import { registerTestUser } from '../tests-shared/testUser';
import { ProfileLink } from './ProfileLink';
import { router } from './router';

const { signIn } = registerTestUser();

afterEach(cleanup);

it('renders nothing while the user is loading', async () => {
  // Given a signed-in user not yet loaded
  await signIn();

  // When it renders
  const { container } = render(<ProfileLink />);

  // Then it is empty
  expect(container).toBeEmptyDOMElement();
});

it('renders nothing when signed out', async () => {
  // Given nobody is signed in

  // When it renders and the user loads
  const { container } = render(<ProfileLink />);
  await authSettled();

  // Then it is empty
  expect(container).toBeEmptyDOMElement();
});

it('takes the user to their profile page', async () => {
  // Given a signed-in user on the home page
  await signIn();
  const memoryRouter = createMemoryRouter(router.routes);
  render(<RouterProvider router={memoryRouter} />);
  await authSettled();

  // When they press Profile in the header
  fireEvent.click(screen.getByRole('link', { name: 'Profile' }));

  // Then they are on the profile page
  expect(memoryRouter.state.location.pathname).toBe('/profile');
  expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
});
