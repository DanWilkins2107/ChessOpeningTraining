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

const byName = <Row extends { name: string }>(rows: Row[]) =>
  [...rows].sort((a, b) => a.name.localeCompare(b.name));

it('returns every folder and move tree with its parent', async () => {
  // Given a user with folders and move trees at the root and nested
  const { id, client } = await signedInUser();
  const [london, caroKann] = await inserted('folders', [
    { owner_id: id, name: 'London' },
    { owner_id: id, name: 'Caro-Kann' },
  ]);
  const [jobava] = await inserted('folders', [
    { owner_id: id, name: 'Jobava', parent_id: london.id },
  ]);
  const [scotch, advance] = await inserted('move_trees', [
    { owner_id: id, name: 'Scotch', side: 'white' },
    { owner_id: id, name: 'Advance', side: 'black', folder_id: jobava.id },
  ]);

  // When they get their repertoire
  const { data, error } = await getRepertoire(client);

  // Then it lists every level, with no other columns
  expect(error).toBeNull();
  expect(byName(data.folders)).toEqual([
    { id: caroKann.id, name: 'Caro-Kann', parent_id: null },
    { id: jobava.id, name: 'Jobava', parent_id: london.id },
    { id: london.id, name: 'London', parent_id: null },
  ]);
  expect(byName(data.move_trees)).toEqual([
    { id: advance.id, name: 'Advance', side: 'black', folder_id: jobava.id },
    { id: scotch.id, name: 'Scotch', side: 'white', folder_id: null },
  ]);
});

it.each([
  ['folders', { name: 'London' }],
  ['move_trees', { name: 'Scotch', side: 'white' }],
])('lists sibling %s in position order', async (table, row) => {
  // Given a user with three siblings, the oldest moved to the end
  const { id, client } = await signedInUser();
  const [first, second, third] = await inserted(
    table,
    ['2026-01-01', '2026-01-02', '2026-01-03'].map((day) => ({
      ...row,
      owner_id: id,
      created_at: `${day}T00:00:00Z`,
    })),
  );
  const { error: moveError } = await admin
    .from(table)
    .update({ position: 5 })
    .eq('id', first.id);
  if (moveError) throw moveError;

  // When they get their repertoire
  const { data } = await getRepertoire(client);

  // Then the siblings come back by position, not by age
  expect(data[table].map(({ id: rowId }) => rowId)).toEqual([
    second.id,
    third.id,
    first.id,
  ]);
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
