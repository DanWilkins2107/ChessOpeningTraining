import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from 'react-error-boundary';
import { expect, it } from 'vitest';
import { createQueryClient } from '../../elements/createQueryClient/createQueryClient';
import { LoadBoundary } from '../LoadBoundary/LoadBoundary';
import { LOADING, LoadError, Loading } from '../../tests-shared/loadStates';
import { registerTestUser } from '../../tests-shared/testUser';
import { useAuthenticatedUser } from './useAuthenticatedUser';

const { user, signIn } = registerTestUser();

function AuthenticatedUserId() {
  return useAuthenticatedUser().id;
}

const renderAuthenticatedUserTestingHarness = () =>
  render(
    <QueryClientProvider client={createQueryClient()}>
      <LoadBoundary Loading={Loading} LoadError={LoadError}>
        <AuthenticatedUserId />
      </LoadBoundary>
    </QueryClientProvider>,
  );

it('suspends until auth is known', () => {
  // Given nothing rendered yet

  // When the harness renders
  renderAuthenticatedUserTestingHarness();

  // Then it shows the loading fallback
  expect(screen.getByText(LOADING)).toBeInTheDocument();
});

it('shows the user of a stored session', async () => {
  // Given a signed-in session in storage
  await signIn();

  // When the harness renders
  renderAuthenticatedUserTestingHarness();

  // Then it shows that user
  expect(await screen.findByText(user.id)).toBeInTheDocument();
});

it('throws when no one is signed in', async () => {
  // Given nothing stored

  // When the harness renders inside an error boundary
  render(
    <QueryClientProvider client={createQueryClient()}>
      <ErrorBoundary fallbackRender={({ error }) => String(error)}>
        <AuthenticatedUserId />
      </ErrorBoundary>
    </QueryClientProvider>,
  );

  // Then the boundary catches the missing user
  expect(
    await screen.findByText(
      'Error: useAuthenticatedUser needs a signed-in user',
    ),
  ).toBeInTheDocument();
});
