import { fireEvent, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { pathOf, renderSettledAt } from '../../tests-shared/renderAt';
import { createTestUser } from '../../tests-shared/testUser';

it('leads back to the account page', async () => {
  // Given a signed-in user on their delete account page
  const { signIn } = await createTestUser();
  await signIn();
  const memoryRouter = await renderSettledAt('/account/delete');

  // When they go back to their account
  fireEvent.click(screen.getByRole('link', { name: 'Back to account' }));

  // Then they are on the account page
  expect(pathOf(memoryRouter)).toBe('/account');
});
