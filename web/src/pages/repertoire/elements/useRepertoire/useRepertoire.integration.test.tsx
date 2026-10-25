import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from 'react-error-boundary';
import { afterEach, expect, it, vi } from 'vitest';
import { createQueryClient } from '../../../../elements/createQueryClient/createQueryClient';
import { authSettled } from '../../../../tests-shared/authSettled';
import { createTestUser } from '../../../../tests-shared/testUser';
import { useRepertoire } from './useRepertoire';

afterEach(() => {
  vi.restoreAllMocks();
});

function FolderCount() {
  const { folders } = useRepertoire();
  return <p>{folders.length} folders</p>;
}

it("throws the server's error when the repertoire fails to load", async () => {
  // Given a signed-in user whose repertoire request fails
  const failing = await createTestUser();
  await failing.signIn();
  const realFetch = window.fetch;
  // mock-reason: get_repertoire reads only the caller's own rows, so the local
  // server cannot be made to fail it on demand.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) =>
    String(input).includes('/rest/v1/rpc/get_repertoire')
      ? Promise.resolve(
          Response.json({ message: 'permission denied' }, { status: 403 }),
        )
      : realFetch(input, init),
  );

  // When the hook renders inside an error boundary
  render(
    <QueryClientProvider client={createQueryClient()}>
      <ErrorBoundary fallbackRender={({ error }) => JSON.stringify(error)}>
        <FolderCount />
      </ErrorBoundary>
    </QueryClientProvider>,
  );
  await authSettled();

  // Then the boundary catches the server's error
  expect(await screen.findByText(/permission denied/)).toBeInTheDocument();
});
