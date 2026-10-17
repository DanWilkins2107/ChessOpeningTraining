import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { supabase } from '../../supabase';
import { renderSettledAt } from '../../tests-shared/renderAt';
import { registerTestUser } from '../../tests-shared/testUser';

const withRepertoire = registerTestUser();
const empty = registerTestUser();
const creating = registerTestUser();

beforeAll(async () => {
  const client = await withRepertoire.signedInClient();
  for (const name of ['Caro-Kann', 'London']) {
    const { error } = await client.from('folders').insert({ name });
    if (error) throw error;
  }
  for (const [name, side] of [
    ['Scotch', 'white'],
    ['Sicilian', 'black'],
  ]) {
    const { error } = await client.from('move_trees').insert({ name, side });
    if (error) throw error;
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

const isRepertoireRequest = (input: RequestInfo | URL) =>
  String(input).includes('/rest/v1/rpc/get_repertoire');

const listedRows = async () =>
  (await screen.findAllByRole('listitem')).map((row) => row.textContent);

it('lists folders, then move trees with their side, newest first', async () => {
  // Given a user with two folders and two move trees
  await withRepertoire.signIn();

  // When the page renders
  await renderSettledAt('/repertoire');

  // Then folders come first, then move trees, each newest first
  expect(await listedRows()).toEqual([
    'London',
    'Caro-Kann',
    'Sicilianblack',
    'Scotchwhite',
  ]);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

it('says so when the user has no folders or move trees', async () => {
  // Given a user with nothing yet
  await empty.signIn();

  // When the page renders
  await renderSettledAt('/repertoire');

  // Then it shows the empty state
  expect(
    await screen.findByText('No folders or move trees yet'),
  ).toBeInTheDocument();
});

it('loads the repertoire again when the user tries again', async () => {
  // Given a user whose first repertoire request fails
  await withRepertoire.signIn();
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
  expect(await listedRows()).toHaveLength(4);
});

it('creates a folder from the page', async () => {
  // Given a signed-in user on the page
  await creating.signIn();
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
