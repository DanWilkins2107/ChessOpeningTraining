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
  NOT_NULL_VIOLATION,
  PERMISSION_DENIED,
} from './tests-shared/pgErrorCodes';

const FOLDER = { name: 'Caro-Kann', side: 'black' };

const createFolder = (client: SupabaseClient, folder: object = FOLDER) =>
  client.from('folders').insert(folder).select().single();

async function existingFolder(client: SupabaseClient) {
  const { data, error } = await createFolder(client);
  if (error) throw error;
  return data;
}

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
    side: 'white',
  }));

it('creates a folder owned by the signed-in user', async () => {
  // Given a signed-in user
  const { id, client } = await signedInUser();

  // When they create a folder with a name and side
  const { data, error } = await createFolder(client);

  // Then it is theirs, with the id and timestamp filled in
  expect(error).toBeNull();
  expect(data).toEqual({
    id: expect.any(String),
    owner_id: id,
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

  // When they change its name and side
  const { data } = await client
    .from('folders')
    .update({ name: 'Slav', side: 'white' })
    .eq('id', folder.id)
    .select()
    .single();

  // Then the folder is updated
  expect(data).toEqual({ ...folder, name: 'Slav', side: 'white' });
});

it.each([
  ['id', async () => crypto.randomUUID()],
  ['created_at', async () => '2000-01-01T00:00:00+00:00'],
  ['owner_id', async () => (await signedInUser()).id],
])('refuses changing a folder’s %s', async (column, newValue) => {
  // Given a user with a folder
  const { client } = await signedInUser();
  const folder = await existingFolder(client);

  // When they change the column
  const { error } = await client
    .from('folders')
    .update({ [column]: await newValue() })
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

it.each([
  ['id', crypto.randomUUID()],
  ['created_at', '2000-01-01T00:00:00+00:00'],
  ['owner_id', crypto.randomUUID()],
])('refuses a client-supplied %s on create', async (column, value) => {
  // Given a signed-in user
  const { client } = await signedInUser();

  // When they create a folder supplying the column
  const { error } = await createFolder(client, { ...FOLDER, [column]: value });

  // Then it is refused
  expect(error?.code).toBe(PERMISSION_DENIED);
});

it.each([
  ['an empty name', { name: '' }, CHECK_VIOLATION],
  ['a name with surrounding spaces', { name: ' Caro-Kann ' }, CHECK_VIOLATION],
  ['a 101-character name', { name: 'a'.repeat(101) }, CHECK_VIOLATION],
  ['a missing name', { name: undefined }, NOT_NULL_VIOLATION],
  ['a side other than white or black', { side: 'red' }, CHECK_VIOLATION],
  ['a missing side', { side: undefined }, NOT_NULL_VIOLATION],
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
