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

type Client = Awaited<ReturnType<typeof pageUser.signedInClient>>;

async function insert(
  client: Client,
  table: 'folders' | 'move_trees',
  row: Record<string, string>,
) {
  const { data, error } = await client
    .from(table)
    .insert(row)
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

async function seedRepertoire(client: Client) {
  await insert(client, 'folders', { name: 'Caro-Kann' });
  const london = await insert(client, 'folders', { name: 'London' });
  await insert(client, 'move_trees', { name: 'Scotch', side: 'white' });
  await insert(client, 'move_trees', { name: 'Sicilian', side: 'black' });
  await insert(client, 'folders', { name: 'Nested', parent_id: london });
  await insert(client, 'move_trees', {
    name: 'Filed',
    side: 'white',
    folder_id: london,
  });
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

it('lists top-level folders, then top-level move trees with a pawn for their side, in the order they were added', async () => {
  // Given a user with two top-level folders and move trees, and one of each inside a folder
  const listing = await createTestUser();
  const client = await listing.signedInClient();
  await seedRepertoire(client);
  await listing.signIn();

  // When the page renders
  await renderSettledAt('/repertoire');

  // Then folders come first, then move trees, each in the order they were added
  expect(
    (await screen.findAllByRole('listitem')).map((row) => row.textContent),
  ).toEqual(['Caro-Kann', 'London', 'Scotch', 'Sicilian']);
  expect(
    screen.getAllByRole('img').map((pawn) => pawn.getAttribute('alt')),
  ).toEqual(['white pawn', 'black pawn']);
  expect(screen.queryByText('No folders yet')).not.toBeInTheDocument();
  expect(loadingRepertoire()).not.toBeInTheDocument();
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
