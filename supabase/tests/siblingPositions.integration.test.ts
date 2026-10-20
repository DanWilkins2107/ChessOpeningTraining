import type { SupabaseClient } from '@supabase/supabase-js';
import { expect, it } from 'vitest';
import { existingFolderId } from './tests-shared/existingFolderId';
import { admin, signedInUser } from './tests-shared/testUsers';
import { CHECK_VIOLATION, UNIQUE_VIOLATION } from './tests-shared/pgErrorCodes';

const TABLES = [
  { table: 'folders', parentColumn: 'parent_id', row: { name: 'Caro-Kann' } },
  {
    table: 'move_trees',
    parentColumn: 'folder_id',
    row: { name: 'Main line', side: 'black' },
  },
];

async function createRows(
  client: SupabaseClient,
  { table, parentColumn, row }: (typeof TABLES)[number],
  parentId: string | null,
  count: number,
) {
  const { data, error } = await client
    .from(table)
    .insert(
      Array.from({ length: count }, () => ({
        ...row,
        [parentColumn]: parentId,
      })),
    )
    .select();
  if (error) throw error;
  return data;
}

const positions = (rows: { position: number }[]) =>
  rows.map(({ position }) => position).sort((a, b) => a - b);

it.each(TABLES)(
  'appends each new $table row after its siblings, per parent',
  async (config) => {
    // Given a user with a folder, and a row already at the root
    const { client } = await signedInUser();
    const folderId = await existingFolderId(client);
    await createRows(client, config, null, 1);

    // When they create rows one at a time, at the root and in the folder
    const created = [];
    for (const parentId of [null, folderId, null, folderId]) {
      created.push(...(await createRows(client, config, parentId, 1)));
    }

    // Then each goes after its own siblings
    expect(created.map(({ position }) => position)).toEqual(
      // A folder is itself a root sibling of the other folders.
      config.table === 'folders' ? [2, 0, 3, 1] : [1, 0, 2, 1],
    );
  },
);

it.each(TABLES)('numbers a multi-row $table create', async (config) => {
  // Given a signed-in user
  const { client } = await signedInUser();

  // When they create three rows in one request
  const created = await createRows(client, config, null, 3);

  // Then they take the next three positions
  expect(positions(created)).toEqual([0, 1, 2]);
});

it.each(TABLES)(
  'keeps $table positions distinct under concurrent creates',
  async (config) => {
    // Given a signed-in user
    const { client } = await signedInUser();

    // When they create ten rows at once
    const created = await Promise.all(
      Array.from({ length: 10 }, () => createRows(client, config, null, 1)),
    );

    // Then each takes its own position
    expect(positions(created.flat())).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  },
);

it.each(TABLES)(
  'refuses two $table siblings at the same position',
  async (config) => {
    // Given a user with two rows at the root
    const { client } = await signedInUser();
    const [first, second] = await createRows(client, config, null, 2);

    // When the second is put at the first's position
    const { error } = await admin
      .from(config.table)
      .update({ position: first.position })
      .eq('id', second.id);

    // Then it is refused
    expect(error?.code).toBe(UNIQUE_VIOLATION);
  },
);

it.each(TABLES)('refuses a negative $table position', async (config) => {
  // Given a user with a row
  const { client } = await signedInUser();
  const [row] = await createRows(client, config, null, 1);

  // When it is put at position -1
  const { error } = await admin
    .from(config.table)
    .update({ position: -1 })
    .eq('id', row.id);

  // Then it is refused
  expect(error?.code).toBe(CHECK_VIOLATION);
});
