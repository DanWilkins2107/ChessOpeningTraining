import { QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { createQueryClient } from '../../elements/createQueryClient/createQueryClient';
import { registerTestUser } from '../../tests-shared/testUser';
import { supabase } from '../../supabase';
import { useUser } from './useUser';

const { user, signIn } = registerTestUser();

afterEach(() => {
  vi.restoreAllMocks();
});

function UserId() {
  const current = useUser();
  if (current === undefined) return 'loading';
  return current === null ? 'signed out' : current.id;
}

const renderUserTestingHarness = () =>
  render(
    <QueryClientProvider client={createQueryClient()}>
      <UserId />
    </QueryClientProvider>,
  );

function expireStoredSession() {
  const key = localStorage.key(0) ?? '';
  const session = JSON.parse(localStorage.getItem(key) ?? '');
  localStorage.setItem(
    key,
    JSON.stringify({ ...session, expires_at: 1, refresh_token: 'revoked' }),
  );
}

it('shows loading until the first auth event arrives', () => {
  // Given nothing rendered yet

  // When the harness renders
  renderUserTestingHarness();

  // Then it shows loading
  expect(screen.getByText('loading')).toBeInTheDocument();
});

it('shows signed out when no session is stored', async () => {
  // Given nothing stored

  // When the harness renders
  renderUserTestingHarness();

  // Then it shows signed out
  expect(await screen.findByText('signed out')).toBeInTheDocument();
});

it('shows the user of a stored session', async () => {
  // Given a signed-in session in storage
  await signIn();

  // When the harness renders
  renderUserTestingHarness();

  // Then it shows that user
  expect(await screen.findByText(user.id)).toBeInTheDocument();
});

it('shows signed out when the stored session cannot be refreshed', async () => {
  // Given a stored session that has expired, with a revoked refresh token
  await signIn();
  expireStoredSession();

  // When the harness renders
  renderUserTestingHarness();

  // Then it shows signed out
  expect(await screen.findByText('signed out')).toBeInTheDocument();
});

it('shows the user once they sign in', async () => {
  // Given a signed-out user on screen
  renderUserTestingHarness();
  await screen.findByText('signed out');

  // When they sign in
  await act(signIn);

  // Then it shows them
  expect(await screen.findByText(user.id)).toBeInTheDocument();
});

it('shows signed out once they sign out', async () => {
  // Given a signed-in user on screen
  await signIn();
  renderUserTestingHarness();
  await screen.findByText(user.id);

  // When they sign out
  await act(() => supabase.auth.signOut());

  // Then it shows signed out
  expect(await screen.findByText('signed out')).toBeInTheDocument();
});

it('asks for the session once, however many components read it', async () => {
  // Given one component showing the user

  // mock-reason: the number of session lookups is the assertion, and the
  // screen looks the same either way. The spy still calls the real client.
  const getSession = vi.spyOn(supabase.auth, 'getSession');
  const client = createQueryClient();
  const { rerender } = render(
    <QueryClientProvider client={client}>
      <p>
        <UserId />
      </p>
    </QueryClientProvider>,
  );
  await screen.findByText('signed out');

  // When a second one mounts
  rerender(
    <QueryClientProvider client={client}>
      <p>
        <UserId />
      </p>
      <p>
        <UserId />
      </p>
    </QueryClientProvider>,
  );
  await screen.findAllByText('signed out');

  // Then the session was looked up once
  expect(getSession).toHaveBeenCalledOnce();
});
