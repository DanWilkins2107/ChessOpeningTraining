import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { createQueryClient } from '../../elements/createQueryClient/createQueryClient';
import { LoadBoundary } from '../LoadBoundary/LoadBoundary';
import {
  ERROR,
  LOADING,
  LoadError,
  Loading,
} from '../../tests-shared/loadStates';
import { registerTestUser } from '../../tests-shared/testUser';
import { useSuspenseUser } from './useSuspenseUser';

const { user, signIn } = registerTestUser();

function SuspenseUserId() {
  return useSuspenseUser().id;
}

const renderSuspenseUserTestingHarness = () =>
  render(
    <QueryClientProvider client={createQueryClient()}>
      <LoadBoundary Loading={Loading} LoadError={LoadError}>
        <SuspenseUserId />
      </LoadBoundary>
    </QueryClientProvider>,
  );

it('suspends until auth is known', () => {
  // Given nothing rendered yet

  // When the harness renders
  renderSuspenseUserTestingHarness();

  // Then it shows the loading fallback
  expect(screen.getByText(LOADING)).toBeInTheDocument();
});

it('shows the user of a stored session', async () => {
  // Given a signed-in session in storage
  await signIn();

  // When the harness renders
  renderSuspenseUserTestingHarness();

  // Then it shows that user
  expect(await screen.findByText(user.id)).toBeInTheDocument();
});

it('throws when no one is signed in', async () => {
  // Given nothing stored

  // When the harness renders
  renderSuspenseUserTestingHarness();

  // Then the error boundary catches it
  expect(
    await screen.findByRole('button', { name: ERROR }),
  ).toBeInTheDocument();
});
