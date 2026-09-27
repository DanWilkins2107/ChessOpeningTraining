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

const BRANCH = { name: 'Caro-Kann', side: 'black' };

const createBranch = (client: SupabaseClient, branch: object = BRANCH) =>
  client.from('branches').insert(branch).select().single();

async function existingBranch(client: SupabaseClient) {
  const { data, error } = await createBranch(client);
  if (error) throw error;
  return data;
}

const storedBranch = async (id: string) =>
  (await admin.from('branches').select().eq('id', id).maybeSingle()).data;

const branchCount = async (ownerId: string) =>
  (
    await admin
      .from('branches')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', ownerId)
  ).count;

const branches = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    name: `Branch ${index}`,
    side: 'white',
  }));

it('creates a branch owned by the signed-in user', async () => {
  // Given a signed-in user
  const { id, client } = await signedInUser();

  // When they create a branch with a name and side
  const { data, error } = await createBranch(client);

  // Then it is theirs, with the id and timestamp filled in
  expect(error).toBeNull();
  expect(data).toEqual({
    id: expect.any(String),
    owner_id: id,
    created_at: expect.any(String),
    ...BRANCH,
  });
});

it('lets the owner read their branch', async () => {
  // Given a user with a branch
  const { client } = await signedInUser();
  const branch = await existingBranch(client);

  // When they read it
  const { data } = await client.from('branches').select().eq('id', branch.id);

  // Then they see it
  expect(data).toEqual([branch]);
});

it('lets the owner rename their branch', async () => {
  // Given a user with a branch
  const { client } = await signedInUser();
  const branch = await existingBranch(client);

  // When they change its name and side
  const { data } = await client
    .from('branches')
    .update({ name: 'Slav', side: 'white' })
    .eq('id', branch.id)
    .select()
    .single();

  // Then the branch is updated
  expect(data).toEqual({ ...branch, name: 'Slav', side: 'white' });
});

it.each([
  ['id', async () => crypto.randomUUID()],
  ['created_at', async () => '2000-01-01T00:00:00+00:00'],
  ['owner_id', async () => (await signedInUser()).id],
])('refuses changing a branch’s %s', async (column, newValue) => {
  // Given a user with a branch
  const { client } = await signedInUser();
  const branch = await existingBranch(client);

  // When they change the column
  const { error } = await client
    .from('branches')
    .update({ [column]: await newValue() })
    .eq('id', branch.id);

  // Then it is refused, and the branch is untouched
  expect(error?.code).toBe(PERMISSION_DENIED);
  expect(await storedBranch(branch.id)).toEqual(branch);
});

it('lets the owner delete their branch', async () => {
  // Given a user with a branch
  const { client } = await signedInUser();
  const branch = await existingBranch(client);

  // When they delete it
  const { error } = await client.from('branches').delete().eq('id', branch.id);

  // Then the branch is gone
  expect(error).toBeNull();
  expect(await storedBranch(branch.id)).toBeNull();
});

it('hides a branch from other users', async () => {
  // Given a branch, and a different signed-in user
  const owner = await signedInUser();
  await existingBranch(owner.client);
  const { client } = await signedInUser();

  // When the other user reads branches
  const { data } = await client.from('branches').select();

  // Then they see nothing
  expect(data).toEqual([]);
});

it.each([
  [
    'renaming',
    (other: SupabaseClient, id: string) =>
      other.from('branches').update({ name: 'Mine now' }).eq('id', id).select(),
  ],
  [
    'deleting',
    (other: SupabaseClient, id: string) =>
      other.from('branches').delete().eq('id', id).select(),
  ],
])('stops other users %s a branch', async (_, request) => {
  // Given a branch, and a different signed-in user
  const owner = await signedInUser();
  const branch = await existingBranch(owner.client);
  const { client } = await signedInUser();

  // When the other user makes the request
  const { data } = await request(client, branch.id);

  // Then nothing is changed, and the branch is untouched
  expect(data).toEqual([]);
  expect(await storedBranch(branch.id)).toEqual(branch);
});

it.each([
  ['read', (anon: SupabaseClient) => anon.from('branches').select()],
  ['create', (anon: SupabaseClient) => createBranch(anon)],
  [
    'rename',
    (anon: SupabaseClient, id: string) =>
      anon.from('branches').update({ name: 'Mine now' }).eq('id', id),
  ],
  [
    'delete',
    (anon: SupabaseClient, id: string) =>
      anon.from('branches').delete().eq('id', id),
  ],
])('refuses a %s by a signed-out visitor', async (_, request) => {
  // Given a branch, and a signed-out visitor
  const owner = await signedInUser();
  const branch = await existingBranch(owner.client);

  // When the visitor makes the request
  const { error } = await request(anonClient(), branch.id);

  // Then it is refused, and the branch is untouched
  expect(error?.code).toBe(PERMISSION_DENIED);
  expect(await storedBranch(branch.id)).toEqual(branch);
});

it.each([
  ['id', crypto.randomUUID()],
  ['created_at', '2000-01-01T00:00:00+00:00'],
  ['owner_id', crypto.randomUUID()],
])('refuses a client-supplied %s on create', async (column, value) => {
  // Given a signed-in user
  const { client } = await signedInUser();

  // When they create a branch supplying the column
  const { error } = await createBranch(client, { ...BRANCH, [column]: value });

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
])('refuses a branch with %s', async (_, change, code) => {
  // Given a signed-in user
  const { client } = await signedInUser();

  // When they create a branch with the invalid value
  const { error } = await createBranch(client, { ...BRANCH, ...change });

  // Then it is refused
  expect(error?.code).toBe(code);
});

it('accepts a 100-character name', async () => {
  // Given a signed-in user
  const { client } = await signedInUser();

  // When they create a branch with a 100-character name
  const { error } = await createBranch(client, {
    ...BRANCH,
    name: 'a'.repeat(100),
  });

  // Then it is created
  expect(error).toBeNull();
});

it('refuses a 101st branch', async () => {
  // Given a user with 100 branches
  const { id, client } = await signedInUser();
  const seeded = await client.from('branches').insert(branches(100));
  expect(seeded.error).toBeNull();

  // When they create another
  const { error } = await createBranch(client);

  // Then it is refused
  expect(error?.code).toBe(CHECK_VIOLATION);
  expect(await branchCount(id)).toBe(100);
});

it('holds the 100-branch cap against concurrent creates', async () => {
  // Given a user with 90 branches
  const { id, client } = await signedInUser();
  const seeded = await client.from('branches').insert(branches(90));
  expect(seeded.error).toBeNull();

  // When they create 20 more at once
  const results = await Promise.all(
    Array.from({ length: 20 }, () => createBranch(client)),
  );

  // Then only enough to reach 100 are created
  expect(results.filter(({ error }) => error === null)).toHaveLength(10);
  expect(await branchCount(id)).toBe(100);
});

it("deletes a user's branches with their account", async () => {
  // Given a user with a branch
  const { id, client } = await signedInUser();
  const branch = await existingBranch(client);

  // When their account is deleted
  await deleteUser(id);

  // Then the branch is gone
  expect(await storedBranch(branch.id)).toBeNull();
});
