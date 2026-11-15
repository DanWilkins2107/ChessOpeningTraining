import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { supabase } from '../../supabase';
import { renderSettledAt } from '../../tests-shared/renderAt';
import { createTestUser, registerTestUser } from '../../tests-shared/testUser';

const pageUser = registerTestUser();

afterEach(() => {
  vi.restoreAllMocks();
});

const isRepertoireRequest = (input: RequestInfo | URL) =>
  String(input).includes('/rest/v1/rpc/get_repertoire');

const loadingRepertoire = () =>
  screen.queryByRole('status', { name: 'Loading repertoire' });

async function expectNoEmptyMessageOnceLoaded() {
  await renderSettledAt('/repertoire');
  await waitFor(() => expect(loadingRepertoire()).not.toBeInTheDocument());
  expect(screen.queryByText('No folders yet')).not.toBeInTheDocument();
}

it('creates a folder from the page', async () => {
  // Given a signed-in user on the page
  await pageUser.signIn();
  await renderSettledAt('/repertoire');

  // When they create a folder
  fireEvent.change(await screen.findByLabelText('Folder name'), {
    target: { value: 'Najdorf' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Create folder' }));

  // Then the field clears and the folder is saved
  await waitFor(() =>
    expect(screen.getByLabelText('Folder name')).toHaveValue(''),
  );
  const { data } = await supabase.from('folders').select('name');
  expect(data).toEqual([{ name: 'Najdorf' }]);
});

it('says so when the user has no folders or move trees', async () => {
  // Given a user with nothing yet
  const empty = await createTestUser();
  await empty.signIn();

  // When the page renders
  await renderSettledAt('/repertoire');

  // Then it shows the empty message once loaded
  expect(await screen.findByText('No folders yet')).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

it('does not say so when the user has a folder', async () => {
  // Given a user with one folder
  const withFolder = await createTestUser();
  const client = await withFolder.signedInClient();
  const { error } = await client.from('folders').insert({ name: 'Najdorf' });
  if (error) throw error;
  await withFolder.signIn();

  // When the page renders and loading finishes
  // Then there is no empty message
  await expectNoEmptyMessageOnceLoaded();
});

it('does not say so when the user has a move tree', async () => {
  // Given a user with one move tree
  const withMoveTree = await createTestUser();
  const client = await withMoveTree.signedInClient();
  const { error } = await client
    .from('move_trees')
    .insert({ name: 'Scotch', side: 'white' });
  if (error) throw error;
  await withMoveTree.signIn();

  // When the page renders and loading finishes
  // Then there is no empty message
  await expectNoEmptyMessageOnceLoaded();
});

it("shows loading, not the previous user's repertoire, when the user changes", async () => {
  // Given one user's empty repertoire on screen, and repertoire requests left
  // unanswered
  const first = await createTestUser();
  const second = await createTestUser();
  await first.signIn();
  await renderSettledAt('/repertoire');
  await screen.findByText('No folders yet');
  const realFetch = window.fetch;
  // mock-reason: the local server answers too fast to see the loading state
  // in between. Other requests are sent for real.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) =>
    isRepertoireRequest(input) ? new Promise(() => {}) : realFetch(input, init),
  );

  // When a different user signs in
  await act(() => second.signIn());

  // Then it shows loading in place of the first user's repertoire
  // (Suspense keeps the old content mounted, just hidden.)
  await waitFor(() => expect(loadingRepertoire()).toBeInTheDocument());
  expect(screen.getByText('No folders yet')).not.toBeVisible();
});

it('shows a generic message when the repertoire fails to load', async () => {
  // Given a user whose repertoire request fails
  const failing = await createTestUser();
  await failing.signIn();
  const realFetch = window.fetch;
  // mock-reason: get_repertoire reads only the caller's own rows, so the local
  // server cannot be made to fail it on demand.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) =>
    isRepertoireRequest(input)
      ? Promise.resolve(
          Response.json({ message: 'permission denied' }, { status: 403 }),
        )
      : realFetch(input, init),
  );

  // When they open the repertoire
  await renderSettledAt('/repertoire');

  // Then they see a generic message, not the server's
  expect(await screen.findByRole('alert')).toHaveTextContent(
    "Couldn't load your repertoire",
  );
  expect(screen.queryByText(/permission denied/)).not.toBeInTheDocument();
});
