import type { SupabaseClient } from '@supabase/supabase-js';
import { expect, it } from 'vitest';
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

const FOLDER = { name: 'Caro-Kann' };

const createFolder = (client: SupabaseClient, folder: object = FOLDER) =>
  client.from('folders').insert(folder).select().single();

async function existingFolder(
  client: SupabaseClient,
  parentId: string | null = null,
) {
  const { data, error } = await createFolder(client, {
    ...FOLDER,
    parent_id: parentId,
  });
  if (error) throw error;
  return data;
}

// Returns the folders from the root down, each inside the one before.
async function nestedFolders(client: SupabaseClient, depth: number) {
  const chain = [await existingFolder(client)];
  while (chain.length < depth) {
    chain.push(await existingFolder(client, chain.at(-1).id));
  }
  return chain;
}

const MOVED_POSITION = 100;

// Clients move folders only through the reorder RPC, so the rules every move must keep are driven directly. The
// position is past any sibling's, so the move never collides with one.
const moveFolder = (id: string, parentId: string | null) =>
  admin
    .from('folders')
    .update({ parent_id: parentId, position: MOVED_POSITION })
    .eq('id', id)
    .select()
    .single();

const storedFolder = async (id: string) =>
  (await admin.from('folders').select().eq('id', id).maybeSingle()).data;

const folderCount = async (ownerId: string) =>
  (
    await admin
      .from('folders')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', ownerId)
  ).count;

const folders = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    name: `Folder ${index}`,
  }));

it('creates a folder owned by the signed-in user', async () => {
  // Given a signed-in user
  const { id, client } = await signedInUser();

  // When they create a folder with a name
  const { data, error } = await createFolder(client);

  // Then it is theirs, with the id and timestamp filled in
  expect(error).toBeNull();
  expect(data).toEqual({
    id: expect.any(String),
    owner_id: id,
    parent_id: null,
    position: 0,
    created_at: expect.any(String),
    ...FOLDER,
  });
});

it('lets the owner read their folder', async () => {
  // Given a user with a folder
  const { client } = await signedInUser();
  const folder = await existingFolder(client);

  // When they read it
  const { data } = await client.from('folders').select().eq('id', folder.id);

  // Then they see it
  expect(data).toEqual([folder]);
});

it('lets the owner rename their folder', async () => {
  // Given a user with a folder
  const { client } = await signedInUser();
  const folder = await existingFolder(client);

  // When they change its name
  const { data } = await client
    .from('folders')
    .update({ name: 'Slav' })
    .eq('id', folder.id)
    .select()
    .single();

  // Then the folder is updated
  expect(data).toEqual({ ...folder, name: 'Slav' });
});

it.each([
  ['id', async () => crypto.randomUUID()],
  ['created_at', async () => randomTimestamp()],
  ['owner_id', async () => (await signedInUser()).id],
  [
    'parent_id',
    async (client: SupabaseClient) => (await existingFolder(client)).id,
  ],
  ['position', async () => 5],
])('refuses changing a folder’s %s', async (column, newValue) => {
  // Given a user with a folder
  const { client } = await signedInUser();
  const folder = await existingFolder(client);

  // When they change the column
  const { error } = await client
    .from('folders')
    .update({ [column]: await newValue(client) })
    .eq('id', folder.id);

  // Then it is refused, and the folder is untouched
  expect(error?.code).toBe(PERMISSION_DENIED);
  expect(await storedFolder(folder.id)).toEqual(folder);
});

it('lets the owner delete their folder', async () => {
  // Given a user with a folder
  const { client } = await signedInUser();
  const folder = await existingFolder(client);

  // When they delete it
  const { error } = await client.from('folders').delete().eq('id', folder.id);

  // Then the folder is gone
  expect(error).toBeNull();
  expect(await storedFolder(folder.id)).toBeNull();
});

it('hides a folder from other users', async () => {
  // Given a folder, and a different signed-in user
  const owner = await signedInUser();
  await existingFolder(owner.client);
  const { client } = await signedInUser();

  // When the other user reads folders
  const { data } = await client.from('folders').select();

  // Then they see nothing
  expect(data).toEqual([]);
});

it.each([
  [
    'renaming',
    (other: SupabaseClient, id: string) =>
      other.from('folders').update({ name: 'Mine now' }).eq('id', id).select(),
  ],
  [
    'deleting',
    (other: SupabaseClient, id: string) =>
      other.from('folders').delete().eq('id', id).select(),
  ],
])('stops other users %s a folder', async (_, request) => {
  // Given a folder, and a different signed-in user
  const owner = await signedInUser();
  const folder = await existingFolder(owner.client);
  const { client } = await signedInUser();

  // When the other user makes the request
  const { data } = await request(client, folder.id);

  // Then nothing is changed, and the folder is untouched
  expect(data).toEqual([]);
  expect(await storedFolder(folder.id)).toEqual(folder);
});

it.each([
  ['read', (anon: SupabaseClient) => anon.from('folders').select()],
  ['create', (anon: SupabaseClient) => createFolder(anon)],
  [
    'rename',
    (anon: SupabaseClient, id: string) =>
      anon.from('folders').update({ name: 'Mine now' }).eq('id', id),
  ],
  [
    'delete',
    (anon: SupabaseClient, id: string) =>
      anon.from('folders').delete().eq('id', id),
  ],
])('refuses a %s by a signed-out visitor', async (_, request) => {
  // Given a folder, and a signed-out visitor
  const owner = await signedInUser();
  const folder = await existingFolder(owner.client);

  // When the visitor makes the request
  const { error } = await request(anonClient(), folder.id);

  // Then it is refused, and the folder is untouched
  expect(error?.code).toBe(PERMISSION_DENIED);
  expect(await storedFolder(folder.id)).toEqual(folder);
});

it.each(SERVER_FILLED_COLUMNS)(
  'refuses a client-supplied %s on create',
  async (column, value) => {
    // Given a signed-in user
    const { client } = await signedInUser();

    // When they create a folder supplying the column
    const { error } = await createFolder(client, {
      ...FOLDER,
      [column]: value,
    });

    // Then it is refused
    expect(error?.code).toBe(PERMISSION_DENIED);
  },
);

it.each([
  ['an empty name', { name: '' }, CHECK_VIOLATION],
  ['a name with surrounding spaces', { name: ' Caro-Kann ' }, CHECK_VIOLATION],
  ['a 101-character name', { name: 'a'.repeat(101) }, CHECK_VIOLATION],
  ['a missing name', { name: undefined }, NOT_NULL_VIOLATION],
])('refuses a folder with %s', async (_, change, code) => {
  // Given a signed-in user
  const { client } = await signedInUser();

  // When they create a folder with the invalid value
  const { error } = await createFolder(client, { ...FOLDER, ...change });

  // Then it is refused
  expect(error?.code).toBe(code);
});

it('accepts a 100-character name', async () => {
  // Given a signed-in user
  const { client } = await signedInUser();

  // When they create a folder with a 100-character name
  const { error } = await createFolder(client, {
    ...FOLDER,
    name: 'a'.repeat(100),
  });

  // Then it is created
  expect(error).toBeNull();
});

it('refuses a 101st folder', async () => {
  // Given a user with 100 folders
  const { id, client } = await signedInUser();
  const seeded = await client.from('folders').insert(folders(100));
  expect(seeded.error).toBeNull();

  // When they create another
  const { error } = await createFolder(client);

  // Then it is refused
  expect(error?.code).toBe(CHECK_VIOLATION);
  expect(await folderCount(id)).toBe(100);
});

it('holds the 100-folder cap against concurrent creates', async () => {
  // Given a user with 90 folders
  const { id, client } = await signedInUser();
  const seeded = await client.from('folders').insert(folders(90));
  expect(seeded.error).toBeNull();

  // When they create 20 more at once
  const results = await Promise.all(
    Array.from({ length: 20 }, () => createFolder(client)),
  );

  // Then only enough to reach 100 are created
  expect(results.filter(({ error }) => error === null)).toHaveLength(10);
  expect(await folderCount(id)).toBe(100);
});

it("deletes a user's folders with their account", async () => {
  // Given a user with a folder
  const { id, client } = await signedInUser();
  const folder = await existingFolder(client);

  // When their account is deleted
  await deleteUser(id);

  // Then the folder is gone
  expect(await storedFolder(folder.id)).toBeNull();
});

it('creates a folder inside the owner’s folder', async () => {
  // Given a user with a folder
  const { client } = await signedInUser();
  const parent = await existingFolder(client);

  // When they create a folder inside it
  const { data, error } = await createFolder(client, {
    ...FOLDER,
    parent_id: parent.id,
  });

  // Then it is created inside that folder
  expect(error).toBeNull();
  expect(data).toMatchObject({ parent_id: parent.id });
});

it('refuses a folder inside another user’s folder', async () => {
  // Given a folder, and a different signed-in user
  const owner = await signedInUser();
  const parent = await existingFolder(owner.client);
  const { id, client } = await signedInUser();

  // When the other user creates a folder inside it
  const { error } = await createFolder(client, {
    ...FOLDER,
    parent_id: parent.id,
  });

  // Then it is refused
  expect(error?.code).toBe(FOREIGN_KEY_VIOLATION);
  expect(await folderCount(id)).toBe(0);
});

it.each([
  ['into another folder', true],
  ['out to the root', false],
])('moves a folder %s', async (_, intoFolder) => {
  // Given a user with a folder inside another, and a root folder
  const { client } = await signedInUser();
  const [, folder] = await nestedFolders(client, 2);
  const root = await existingFolder(client);
  const parentId = intoFolder ? root.id : null;

  // When the folder is moved
  const { data, error } = await moveFolder(folder.id, parentId);

  // Then it is moved
  expect(error).toBeNull();
  expect(data).toEqual({
    ...folder,
    parent_id: parentId,
    position: MOVED_POSITION,
  });
});

it('refuses moving a folder into another user’s folder', async () => {
  // Given a user with a folder, and another user’s folder
  const { client } = await signedInUser();
  const folder = await existingFolder(client);
  const other = await signedInUser();
  const otherFolder = await existingFolder(other.client);

  // When they move their folder into the other user’s
  const { error } = await moveFolder(folder.id, otherFolder.id);

  // Then it is refused, and the folder is untouched
  expect(error?.code).toBe(FOREIGN_KEY_VIOLATION);
  expect(await storedFolder(folder.id)).toEqual(folder);
});

it.each([
  ['itself', 0],
  ['a folder inside it', 1],
  ['a folder two levels inside it', 2],
])('refuses moving a folder into %s', async (_, levelsDown) => {
  // Given a user with nested folders
  const { client } = await signedInUser();
  const chain = await nestedFolders(client, 3);

  // When the outermost is moved into one of its own descendants (or itself)
  const { error } = await moveFolder(chain[0].id, chain[levelsDown].id);

  // Then it is refused, and the folder is untouched
  expect(error?.code).toBe(CHECK_VIOLATION);
  expect(await storedFolder(chain[0].id)).toEqual(chain[0]);
});

it('accepts folders nested 10 deep', async () => {
  // Given a user with folders nested 9 deep
  const { client } = await signedInUser();
  const chain = await nestedFolders(client, 9);

  // When they create a folder inside the innermost
  const { error } = await createFolder(client, {
    ...FOLDER,
    parent_id: chain[8].id,
  });

  // Then it is created
  expect(error).toBeNull();
});

it('refuses folders nested 11 deep', async () => {
  // Given a user with folders nested 10 deep
  const { id, client } = await signedInUser();
  const chain = await nestedFolders(client, 10);

  // When they create a folder inside the innermost
  const { error } = await createFolder(client, {
    ...FOLDER,
    parent_id: chain[9].id,
  });

  // Then it is refused
  expect(error?.code).toBe(CHECK_VIOLATION);
  expect(await folderCount(id)).toBe(10);
});

it.each([
  ['refuses', 9, CHECK_VIOLATION],
  ['accepts', 8, undefined],
])(
  '%s a move that nests the moved folder’s subfolders too deep',
  async (_, targetDepth, code) => {
    // Given a user with a folder that has a subfolder, and a separate chain of nested folders
    const { client } = await signedInUser();
    const [folder] = await nestedFolders(client, 2);
    const chain = await nestedFolders(client, targetDepth);

    // When the folder is moved into the innermost of the chain
    const { error } = await moveFolder(folder.id, chain.at(-1).id);

    // Then the subfolder ends up past 10 deep only if refused
    expect(error?.code).toBe(code);
  },
);

it('holds against concurrent moves forming a cycle', async () => {
  // Given a user with two root folders
  const { client } = await signedInUser();
  const first = await existingFolder(client);
  const second = await existingFolder(client);

  // When each is moved into the other at once
  const results = await Promise.all([
    moveFolder(first.id, second.id),
    moveFolder(second.id, first.id),
  ]);

  // Then only one move happens
  expect(results.filter(({ error }) => error === null)).toHaveLength(1);
});

it('deletes a folder’s subfolders and their move trees with it', async () => {
  // Given a user with a folder, a subfolder, and a move tree in the subfolder
  const { client } = await signedInUser();
  const [folder, subfolder] = await nestedFolders(client, 2);
  const moveTree = await client
    .from('move_trees')
    .insert({ folder_id: subfolder.id, name: 'Main line', side: 'black' })
    .select()
    .single();
  expect(moveTree.error).toBeNull();

  // When they delete the folder
  const { error } = await client.from('folders').delete().eq('id', folder.id);

  // Then the subfolder and move tree are gone too
  expect(error).toBeNull();
  expect(await storedFolder(subfolder.id)).toBeNull();
  const storedMoveTree = await admin
    .from('move_trees')
    .select()
    .eq('id', moveTree.data.id)
    .maybeSingle();
  expect(storedMoveTree.data).toBeNull();
});
