import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { existingFolderId } from './tests-shared/existingFolderId';
import { admin, anonClient, signedInUser } from './tests-shared/testUsers';
import {
  CHECK_VIOLATION,
  NOT_FOUND,
  PERMISSION_DENIED,
  UNIQUE_VIOLATION,
} from './tests-shared/pgErrorCodes';

const TABLES = [
  {
    table: 'folders',
    parentColumn: 'parent_id',
    row: { name: 'Caro-Kann' },
    move: 'move_folder',
  },
  {
    table: 'move_trees',
    parentColumn: 'folder_id',
    row: { name: 'Main line', side: 'black' },
    move: 'move_move_tree',
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

const moveRow = (
  client: SupabaseClient,
  { parentColumn, move }: (typeof TABLES)[number],
  id: string,
  parentId: string | null,
  position: number,
) => client.rpc(move, { id, [parentColumn]: parentId, position });

// The ids of a parent's rows in position order, checking the positions run 0..n-1.
async function childIds(
  { table, parentColumn }: (typeof TABLES)[number],
  parentId: string,
) {
  const { data, error } = await admin
    .from(table)
    .select('id, position')
    .eq(parentColumn, parentId)
    .order('position');
  if (error) throw error;
  expect(data.map(({ position }) => position)).toEqual(data.map((_, i) => i));
  return data.map(({ id }) => id);
}

const ids = (rows: { id: string }[]) => rows.map(({ id }) => id);

it.each(TABLES)(
  'moves a $table row between parents, renumbering both',
  async (config) => {
    // Given a user with two folders, three rows in the first and two in the second
    const { client } = await signedInUser();
    const from = await existingFolderId(client);
    const to = await existingFolderId(client);
    const [first, moved, last] = await createRows(client, config, from, 3);
    const existing = await createRows(client, config, to, 2);

    // When the middle row is moved to position 1 in the second folder
    const { error } = await moveRow(client, config, moved.id, to, 1);

    // Then both folders' rows are numbered from 0 in their new order
    expect(error).toBeNull();
    expect(await childIds(config, from)).toEqual(ids([first, last]));
    expect(await childIds(config, to)).toEqual(
      ids([existing[0], moved, existing[1]]),
    );
  },
);

describe.each(TABLES)('$table', (config) => {
  it.each([
    ['to the front', 0, [2, 0, 1]],
    ['to the back', 2, [0, 1, 2]],
    ['backwards', 1, [0, 2, 1]],
    ['forwards from the front', 1, [1, 0, 2], 0],
    ['before the front, to the front', -5, [2, 0, 1]],
    ['past the back, to the back', 99, [0, 1, 2]],
  ])(
    'reorders a row within its parent %s',
    async (_, position, order, movedIndex = 2) => {
      // Given a user with three rows in a folder
      const { client } = await signedInUser();
      const folderId = await existingFolderId(client);
      const rows = await createRows(client, config, folderId, 3);

      // When one is moved to the position
      const { error } = await moveRow(
        client,
        config,
        rows[movedIndex].id,
        folderId,
        position,
      );

      // Then the rows are numbered from 0 in their new order
      expect(error).toBeNull();
      expect(await childIds(config, folderId)).toEqual(
        order.map((index) => rows[index].id),
      );
    },
  );
});

it.each(TABLES)(
  'closes gaps left by deleted $table rows on a move',
  async (config) => {
    // Given a user with four rows in a folder, the second deleted
    const { client } = await signedInUser();
    const folderId = await existingFolderId(client);
    const [first, deleted, third, fourth] = await createRows(
      client,
      config,
      folderId,
      4,
    );
    await admin.from(config.table).delete().eq('id', deleted.id);

    // When the last is moved to the front
    const { error } = await moveRow(client, config, fourth.id, folderId, 0);

    // Then the rest are numbered from 0 without the gap
    expect(error).toBeNull();
    expect(await childIds(config, folderId)).toEqual(
      ids([fourth, first, third]),
    );
  },
);

it.each(TABLES)(
  'keeps $table positions distinct under concurrent moves',
  async (config) => {
    // Given a user with two folders of five rows each
    const { client } = await signedInUser();
    const left = await existingFolderId(client);
    const right = await existingFolderId(client);
    const leftRows = await createRows(client, config, left, 5);
    const rightRows = await createRows(client, config, right, 5);

    // When every row is moved to the other folder's front at once
    const results = await Promise.all([
      ...leftRows.map(({ id }) => moveRow(client, config, id, right, 0)),
      ...rightRows.map(({ id }) => moveRow(client, config, id, left, 0)),
    ]);

    // Then every move happens, and both folders stay numbered from 0
    expect(results.map(({ error }) => error)).toEqual(results.map(() => null));
    expect((await childIds(config, left)).sort()).toEqual(
      ids(rightRows).sort(),
    );
    expect((await childIds(config, right)).sort()).toEqual(
      ids(leftRows).sort(),
    );
  },
);

it.each(
  TABLES.flatMap((config) => [
    { ...config, moving: 'another user’s row', othersRow: true },
    { ...config, moving: 'into another user’s folder', othersRow: false },
  ]),
)('refuses moving $table: $moving', async (config) => {
  // Given a user with a folder and a row, and another user with the same
  const { client } = await signedInUser();
  const folderId = await existingFolderId(client);
  const [row] = await createRows(client, config, null, 1);
  const other = await signedInUser();
  const otherFolderId = await existingFolderId(other.client);
  const [otherRow] = await createRows(other.client, config, null, 1);

  // When they move the other user's row into their folder, or theirs into the other user's
  const { error } = config.othersRow
    ? await moveRow(client, config, otherRow.id, folderId, 0)
    : await moveRow(client, config, row.id, otherFolderId, 0);

  // Then it is refused as not found, and neither row moves
  expect(error?.code).toBe(NOT_FOUND);
  const { data } = await admin
    .from(config.table)
    .select(config.parentColumn)
    .in('id', [row.id, otherRow.id]);
  expect(data).toEqual([
    { [config.parentColumn]: null },
    { [config.parentColumn]: null },
  ]);
});

it.each(TABLES)(
  'refuses a $table move by a signed-out visitor',
  async (config) => {
    // Given a user with a row, and a signed-out visitor
    const { client } = await signedInUser();
    const [row] = await createRows(client, config, null, 1);

    // When the visitor moves it
    const { error } = await moveRow(anonClient(), config, row.id, null, 0);

    // Then it is refused
    expect(error?.code).toBe(PERMISSION_DENIED);
  },
);
