import { fireEvent, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { pathOf, renderAt, renderSettledAt } from '../tests-shared/renderAt';
import { registerTestUser } from '../tests-shared/testUser';

const { signIn } = registerTestUser();

const accountLink = () => screen.getByRole('link', { name: 'Account' });

it('offers the account link before anyone has signed in', () => {
  // Given nobody is signed in

  // When the header renders
  renderAt('/');

  // Then the account link is already there
  expect(accountLink()).toBeInTheDocument();
});

it('takes a signed-in user to their account page', async () => {
  // Given a signed-in user on the home page
  await signIn();
  const memoryRouter = await renderSettledAt('/');

  // When they press Account in the header
  fireEvent.click(accountLink());

  // Then they are on the account page
  expect(pathOf(memoryRouter)).toBe('/account');
});
