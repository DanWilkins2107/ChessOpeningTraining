import type { SupabaseClient } from '@supabase/supabase-js';
import { expect, it } from 'vitest';
import { admin, anonClient, signedInUser } from './tests-shared/testUsers';
import { PERMISSION_DENIED } from './tests-shared/pgErrorCodes';

const getRepertoire = (client: SupabaseClient) => client.rpc('get_repertoire');

async function inserted(table: string, rows: object[]) {
  const { data, error } = await admin.from(table).insert(rows).select();
  if (error) throw error;
  return data;
}

it('returns top-level folders and move trees, newest first', async () => {
  // Given a user with two top-level folders, a folder inside one, two
  // top-level move trees and a move tree inside a folder
  const { id, client } = await signedInUser();
  const [london, caroKann] = await inserted('folders', [
    { owner_id: id, name: 'London', created_at: '2026-01-02T00:00:00Z' },
    { owner_id: id, name: 'Caro-Kann', created_at: '2026-01-01T00:00:00Z' },
  ]);
  await inserted('folders', [
    { owner_id: id, name: 'Jobava', parent_id: london.id },
  ]);
  const [scotch, sicilian] = await inserted('move_trees', [
    {
      owner_id: id,
      name: 'Scotch',
      side: 'white',
      created_at: '2026-01-01T00:00:00Z',
    },
    {
      owner_id: id,
      name: 'Sicilian',
      side: 'black',
      created_at: '2026-01-02T00:00:00Z',
    },
  ]);
  await inserted('move_trees', [
    { owner_id: id, name: 'Advance', side: 'white', folder_id: caroKann.id },
  ]);

  // When they get their repertoire
  const { data, error } = await getRepertoire(client);

  // Then it lists only the top level, newest first, with no other columns
  expect(error).toBeNull();
  expect(data).toEqual({
    folders: [
      { id: london.id, name: 'London' },
      { id: caroKann.id, name: 'Caro-Kann' },
    ],
    move_trees: [
      { id: sicilian.id, name: 'Sicilian', side: 'black' },
      { id: scotch.id, name: 'Scotch', side: 'white' },
    ],
  });
});

it('returns empty lists for a user with nothing yet', async () => {
  // Given a new user
  const { client } = await signedInUser();

  // When they get their repertoire
  const { data, error } = await getRepertoire(client);

  // Then both lists are empty
  expect(error).toBeNull();
  expect(data).toEqual({ folders: [], move_trees: [] });
});

it("leaves out other users' folders and move trees", async () => {
  // Given another user with a folder and a move tree
  const other = await signedInUser();
  await inserted('folders', [{ owner_id: other.id, name: 'London' }]);
  await inserted('move_trees', [
    { owner_id: other.id, name: 'Scotch', side: 'white' },
  ]);
  const { client } = await signedInUser();

  // When a different user gets their repertoire
  const { data } = await getRepertoire(client);

  // Then none of the other user's rows are in it
  expect(data).toEqual({ folders: [], move_trees: [] });
});

it('refuses a signed-out visitor', async () => {
  // Given a signed-out visitor

  // When they get the repertoire
  const { error } = await getRepertoire(anonClient());

  // Then it is refused
  expect(error?.code).toBe(PERMISSION_DENIED);
});
