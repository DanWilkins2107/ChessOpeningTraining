import type { SupabaseClient } from '@supabase/supabase-js';
import { env } from 'node:process';
import { expect, it } from 'vitest';
import type { MoveNode } from '../../web/src/elements/MoveNode/MoveNode';
import { leaves, move } from '../../web/src/tests-shared/moveNode';
import {
  admin,
  anonClient,
  deleteUser,
  signedInUser,
} from './tests-shared/testUsers';
import {
  CHECK_VIOLATION,
  FOREIGN_KEY_VIOLATION,
  NOT_NULL_VIOLATION,
  PERMISSION_DENIED,
} from './tests-shared/pgErrorCodes';
import { randomTimestamp } from './tests-shared/randomTimestamp';
import { SERVER_FILLED_COLUMNS } from './tests-shared/serverFilledColumns';

const MAX_MOVES_BYTES = 512 * 1024;

const MOVES = [move('e4', move('c6', move('d4'), move('Nc3')))];

async function existingFolderId(client: SupabaseClient): Promise<string> {
  const { data, error } = await client
    .from('folders')
    .insert({ name: 'Caro-Kann' })
    .select()
    .single();
  if (error) throw error;
  return data.id;
}

async function folderOwner() {
  const { id, client } = await signedInUser();
  return { id, client, folderId: await existingFolderId(client) };
}

const createMoveTree = (
  client: SupabaseClient,
  folderId: string | null,
  moveTree: object = {},
) =>
  client
    .from('move_trees')
    .insert({
      folder_id: folderId,
      name: 'Main line',
      side: 'black',
      ...moveTree,
    })
    .select()
    .single();

async function existingMoveTree(
  client: SupabaseClient,
  folderId: string | null,
) {
  const { data, error } = await createMoveTree(client, folderId, {
    moves: MOVES,
  });
  if (error) throw error;
  return data;
}

const storedMoveTree = async (id: string) =>
  (await admin.from('move_trees').select().eq('id', id).maybeSingle()).data;

const moveTreeCount = async (column: 'folder_id' | 'owner_id', id: string) =>
  (
    await admin
      .from('move_trees')
      .select('*', { count: 'exact', head: true })
      .eq(column, id)
  ).count;

const moveTrees = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    name: `Move tree ${index}`,
    side: 'white',
  }));

// Node's JSON.stringify recurses per nesting level and overflows its default stack at about 670 plies
// (578 through supabase-js), so deep lines are sent as a prebuilt body. Chromium stringifies 100,000.
async function createMoveTreeWithLine(
  client: SupabaseClient,
  folderId: string,
  plies: number,
): Promise<{ code: string } | null> {
  const moves =
    '[{"san":"e4","children":'.repeat(plies) + '[]' + '}]'.repeat(plies);
  const { data } = await client.auth.getSession();
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/move_trees`, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${data.session!.access_token}`,
      'Content-Type': 'application/json',
    },
    body: `{"folder_id":"${folderId}","name":"Main line","side":"black","moves":${moves}}`,
  });
  return response.ok ? null : await response.json();
}

const movesOfTextLength = (bytes: number) => {
  const padding = JSON.stringify([{ san: '', children: [] }]).length + 3;
  return [move('a'.repeat(bytes - padding))];
};

it('creates a move tree with no moves in the owner’s folder', async () => {
  // Given a user with a folder
  const { id, client, folderId } = await folderOwner();

  // When they create a move tree with just a name and side
  const { data, error } = await createMoveTree(client, folderId);

  // Then it is theirs and in their folder, with no moves and the id and timestamp filled in
  expect(error).toBeNull();
  expect(data).toEqual({
    id: expect.any(String),
    owner_id: id,
    folder_id: folderId,
    name: 'Main line',
    side: 'black',
    moves: [],
    created_at: expect.any(String),
  });
});

it('creates a move tree outside any folder', async () => {
  // Given a signed-in user
  const { id, client } = await signedInUser();

  // When they create a move tree with no folder
  const { data, error } = await createMoveTree(client, null);

  // Then it is theirs, at the top level
  expect(error).toBeNull();
  expect(data).toMatchObject({ owner_id: id, folder_id: null });
});

it('lets the owner read their move tree', async () => {
  // Given a user with a move tree
  const { client, folderId } = await folderOwner();
  const moveTree = await existingMoveTree(client, folderId);

  // When they read it
  const { data } = await client
    .from('move_trees')
    .select()
    .eq('id', moveTree.id);

  // Then they see it, moves included
  expect(data).toEqual([moveTree]);
  expect(moveTree.moves).toEqual(MOVES);
});

it('lets the owner change a move tree’s name, side and moves', async () => {
  // Given a user with a move tree
  const { client, folderId } = await folderOwner();
  const moveTree = await existingMoveTree(client, folderId);
  const change = { name: 'Sidelines', side: 'white', moves: [move('d4')] };

  // When they change its name, side and moves
  const { data } = await client
    .from('move_trees')
    .update(change)
    .eq('id', moveTree.id)
    .select()
    .single();

  // Then the move tree is updated
  expect(data).toEqual({ ...moveTree, ...change });
});

it.each([
  ['id', async () => crypto.randomUUID()],
  ['created_at', async () => randomTimestamp()],
  ['folder_id', existingFolderId],
  ['owner_id', async () => (await signedInUser()).id],
])('refuses changing a move tree’s %s', async (column, newValue) => {
  // Given a user with a move tree
  const { client, folderId } = await folderOwner();
  const moveTree = await existingMoveTree(client, folderId);

  // When they change the column
  const { error } = await client
    .from('move_trees')
    .update({ [column]: await newValue(client) })
    .eq('id', moveTree.id);

  // Then it is refused, and the move tree is untouched
  expect(error?.code).toBe(PERMISSION_DENIED);
  expect(await storedMoveTree(moveTree.id)).toEqual(moveTree);
});

it('lets the owner delete their move tree', async () => {
  // Given a user with a move tree
  const { client, folderId } = await folderOwner();
  const moveTree = await existingMoveTree(client, folderId);

  // When they delete it
  const { error } = await client
    .from('move_trees')
    .delete()
    .eq('id', moveTree.id);

  // Then the move tree is gone
  expect(error).toBeNull();
  expect(await storedMoveTree(moveTree.id)).toBeNull();
});

it.each([
  ['in a folder', existingFolderId],
  ['outside any folder', async () => null],
])('hides a move tree %s from other users', async (_, folderId) => {
  // Given a move tree, and a different signed-in user
  const owner = await signedInUser();
  await existingMoveTree(owner.client, await folderId(owner.client));
  const { client } = await signedInUser();

  // When the other user reads move trees
  const { data } = await client.from('move_trees').select();

  // Then they see nothing
  expect(data).toEqual([]);
});

it.each([
  [
    'renaming',
    (other: SupabaseClient, id: string) =>
      other
        .from('move_trees')
        .update({ name: 'Mine now' })
        .eq('id', id)
        .select(),
  ],
  [
    'deleting',
    (other: SupabaseClient, id: string) =>
      other.from('move_trees').delete().eq('id', id).select(),
  ],
])('stops other users %s a move tree', async (_, request) => {
  // Given a move tree, and a different signed-in user
  const owner = await folderOwner();
  const moveTree = await existingMoveTree(owner.client, owner.folderId);
  const { client } = await signedInUser();

  // When the other user makes the request
  const { data } = await request(client, moveTree.id);

  // Then nothing is changed, and the move tree is untouched
  expect(data).toEqual([]);
  expect(await storedMoveTree(moveTree.id)).toEqual(moveTree);
});

it('refuses a move tree in another user’s folder', async () => {
  // Given a folder, and a different signed-in user
  const owner = await folderOwner();
  const { client } = await signedInUser();

  // When the other user adds a move tree to it
  const { error } = await createMoveTree(client, owner.folderId);

  // Then it is refused
  expect(error?.code).toBe(FOREIGN_KEY_VIOLATION);
  expect(await moveTreeCount('folder_id', owner.folderId)).toBe(0);
});

it.each([
  ['read', (anon: SupabaseClient) => anon.from('move_trees').select()],
  [
    'create',
    (anon: SupabaseClient, moveTree: { folder_id: string }) =>
      createMoveTree(anon, moveTree.folder_id),
  ],
  [
    'rename',
    (anon: SupabaseClient, moveTree: { id: string }) =>
      anon
        .from('move_trees')
        .update({ name: 'Mine now' })
        .eq('id', moveTree.id),
  ],
  [
    'delete',
    (anon: SupabaseClient, moveTree: { id: string }) =>
      anon.from('move_trees').delete().eq('id', moveTree.id),
  ],
])('refuses a %s by a signed-out visitor', async (_, request) => {
  // Given a move tree, and a signed-out visitor
  const owner = await folderOwner();
  const moveTree = await existingMoveTree(owner.client, owner.folderId);

  // When the visitor makes the request
  const { error } = await request(anonClient(), moveTree);

  // Then it is refused, and the move tree is untouched
  expect(error?.code).toBe(PERMISSION_DENIED);
  expect(await storedMoveTree(moveTree.id)).toEqual(moveTree);
});

it.each(SERVER_FILLED_COLUMNS)(
  'refuses a client-supplied %s on create',
  async (column, value) => {
    // Given a user with a folder
    const { client, folderId } = await folderOwner();

    // When they create a move tree supplying the column
    const { error } = await createMoveTree(client, folderId, {
      [column]: value,
    });

    // Then it is refused
    expect(error?.code).toBe(PERMISSION_DENIED);
  },
);

it.each([
  ['an empty name', { name: '' }, CHECK_VIOLATION],
  ['a name with surrounding spaces', { name: ' Main line ' }, CHECK_VIOLATION],
  ['a 101-character name', { name: 'a'.repeat(101) }, CHECK_VIOLATION],
  ['a missing name', { name: undefined }, NOT_NULL_VIOLATION],
  ['a side other than white or black', { side: 'red' }, CHECK_VIOLATION],
  ['a missing side', { side: undefined }, NOT_NULL_VIOLATION],
  ['null moves', { moves: null }, NOT_NULL_VIOLATION],
  ['moves that are not an array', { moves: {} }, CHECK_VIOLATION],
  ['a move that is not an object', { moves: ['e4'] }, CHECK_VIOLATION],
  ['a null move', { moves: [null] }, CHECK_VIOLATION],
  ['a move without a san', { moves: [{ children: [] }] }, CHECK_VIOLATION],
  [
    'a move whose san is not a string',
    { moves: [{ san: 4, children: [] }] },
    CHECK_VIOLATION,
  ],
  ['a move without children', { moves: [{ san: 'e4' }] }, CHECK_VIOLATION],
  [
    'a move whose children are not an array',
    { moves: [{ san: 'e4', children: {} }] },
    CHECK_VIOLATION,
  ],
  [
    'a move with an extra key',
    { moves: [{ ...move('e4'), comment: 'Best by test' }] },
    CHECK_VIOLATION,
  ],
  [
    'an invalid move deep in a sideline',
    // as-reason: the move deliberately lacks the children MoveNode requires,
    // to prove a malformed move deep in the tree is refused.
    { moves: [move('e4', move('c6', { san: 'd4' } as MoveNode))] },
    CHECK_VIOLATION,
  ],
  ['1001 lines at one ply', { moves: leaves(1001) }, CHECK_VIOLATION],
  [
    '1001 lines ending at different plies',
    { moves: [...leaves(600), move('d4', ...leaves(401))] },
    CHECK_VIOLATION,
  ],
  [
    'moves over 512 KB',
    { moves: movesOfTextLength(MAX_MOVES_BYTES + 1) },
    CHECK_VIOLATION,
  ],
])('refuses a move tree with %s', async (_, change, code) => {
  // Given a user with a folder
  const { client, folderId } = await folderOwner();

  // When they create a move tree with the invalid value
  const { error } = await createMoveTree(client, folderId, change);

  // Then it is refused
  expect(error?.code).toBe(code);
});

it.each([
  ['a 100-character name', { name: 'a'.repeat(100) }],
  ['1000 lines at one ply', { moves: leaves(1000) }],
  [
    '1000 lines ending at different plies',
    { moves: [...leaves(600), move('d4', ...leaves(400))] },
  ],
  ['moves of exactly 512 KB', { moves: movesOfTextLength(MAX_MOVES_BYTES) }],
])('accepts a move tree with %s', async (_, change) => {
  // Given a user with a folder
  const { client, folderId } = await folderOwner();

  // When they create a move tree with the value at its limit
  const { error } = await createMoveTree(client, folderId, change);

  // Then it is created
  expect(error).toBeNull();
});

it('accepts a 600-ply line', async () => {
  // Given a user with a folder
  const { client, folderId } = await folderOwner();

  // When they create a move tree whose moves are one 600-ply line
  const error = await createMoveTreeWithLine(client, folderId, 600);

  // Then it is created
  expect(error).toBeNull();
});

it.each([601, 5000])('refuses a %i-ply line', async (plies) => {
  // Given a user with a folder
  const { client, folderId } = await folderOwner();

  // When they create a move tree whose moves are one line that long
  const error = await createMoveTreeWithLine(client, folderId, plies);

  // Then it is refused
  expect(error?.code).toBe(CHECK_VIOLATION);
  expect(await moveTreeCount('folder_id', folderId)).toBe(0);
});

it('refuses changing moves to invalid ones', async () => {
  // Given a user with a move tree
  const { client, folderId } = await folderOwner();
  const moveTree = await existingMoveTree(client, folderId);

  // When they change its moves to invalid ones
  const { error } = await client
    .from('move_trees')
    .update({ moves: [{ san: 'd4' }] })
    .eq('id', moveTree.id);

  // Then it is refused, and the move tree is untouched
  expect(error?.code).toBe(CHECK_VIOLATION);
  expect(await storedMoveTree(moveTree.id)).toEqual(moveTree);
});

it('refuses a 501st move tree, in or out of a folder', async () => {
  // Given a user with 500 move trees outside any folder
  const { id, client, folderId } = await folderOwner();
  const seeded = await client.from('move_trees').insert(moveTrees(500));
  expect(seeded.error).toBeNull();

  // When they create another in a folder
  const { error } = await createMoveTree(client, folderId);

  // Then it is refused
  expect(error?.code).toBe(CHECK_VIOLATION);
  expect(await moveTreeCount('owner_id', id)).toBe(500);
});

it('holds the 500-move-tree cap against concurrent creates', async () => {
  // Given a user with 490 move trees
  const { id, client } = await signedInUser();
  const seeded = await client.from('move_trees').insert(moveTrees(490));
  expect(seeded.error).toBeNull();

  // When they create 20 more at once
  const results = await Promise.all(
    Array.from({ length: 20 }, () => createMoveTree(client, null)),
  );

  // Then only enough to reach 500 are created
  expect(results.filter(({ error }) => error === null)).toHaveLength(10);
  expect(await moveTreeCount('owner_id', id)).toBe(500);
});

it('deletes a folder’s move trees with the folder', async () => {
  // Given a user with a move tree
  const { client, folderId } = await folderOwner();
  const moveTree = await existingMoveTree(client, folderId);

  // When they delete the folder
  const { error } = await client.from('folders').delete().eq('id', folderId);

  // Then the move tree is gone
  expect(error).toBeNull();
  expect(await storedMoveTree(moveTree.id)).toBeNull();
});

it("deletes a user's move trees with their account", async () => {
  // Given a user with a move tree outside any folder
  const { id, client } = await signedInUser();
  const moveTree = await existingMoveTree(client, null);

  // When their account is deleted
  await deleteUser(id);

  // Then the move tree is gone
  expect(await storedMoveTree(moveTree.id)).toBeNull();
});
