import { fireEvent, screen, waitFor } from '@testing-library/react';
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
  await renderSettledAt('/repertoire');
  await waitFor(() =>
    expect(screen.queryByRole('status')).not.toBeInTheDocument(),
  );

  // Then there is no empty message
  expect(screen.queryByText('No folders yet')).not.toBeInTheDocument();
});

it('loads the repertoire again when the user tries again', async () => {
  // Given a user whose first repertoire request fails
  const retrying = await createTestUser();
  await retrying.signIn();
  const realFetch = window.fetch;
  let failed = false;
  // mock-reason: get_repertoire reads only the caller's own rows, so the local
  // server cannot be made to fail it on demand. Only the first one is failed.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) => {
    if (failed || !isRepertoireRequest(input)) return realFetch(input, init);
    failed = true;
    return Promise.resolve(
      Response.json({ message: 'permission denied' }, { status: 403 }),
    );
  });
  await renderSettledAt('/repertoire');

  // When they see a generic message and try again
  expect(await screen.findByRole('alert')).toHaveTextContent(
    "Couldn't load your repertoire",
  );
  expect(screen.queryByText(/permission denied/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

  // Then their repertoire shows
  expect(await screen.findByText('No folders yet')).toBeInTheDocument();
});
