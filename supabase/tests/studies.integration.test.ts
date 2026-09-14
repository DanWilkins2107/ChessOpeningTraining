import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { env } from 'node:process';
import { afterAll, expect, it } from 'vitest';

const PERMISSION_DENIED = '42501';
const CHECK_VIOLATION = '23514';
const NOT_NULL_VIOLATION = '23502';

const STUDY = { name: 'Caro-Kann', side: 'black' };

const noSession = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(
  env.SUPABASE_URL!,
  env.SUPABASE_SERVICE_ROLE_KEY!,
  noSession,
);
const anonClient = () =>
  createClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!, noSession);

const userIds: string[] = [];

afterAll(() => Promise.all(userIds.map(deleteUser)));

async function deleteUser(id: string) {
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) throw error;
}

async function signedInUser() {
  const credentials = {
    email: `test-${crypto.randomUUID()}@example.test`,
    password: crypto.randomUUID(),
  };
  const { data, error } = await admin.auth.admin.createUser({
    ...credentials,
    email_confirm: true,
  });
  if (error) throw error;
  userIds.push(data.user.id);

  const client = anonClient();
  const signIn = await client.auth.signInWithPassword(credentials);
  if (signIn.error) throw signIn.error;
  return { id: data.user.id, client };
}

const createStudy = (client: SupabaseClient, study: object = STUDY) =>
  client.from('studies').insert(study).select().single();

async function existingStudy(client: SupabaseClient) {
  const { data, error } = await createStudy(client);
  if (error) throw error;
  return data;
}

const storedStudy = async (id: string) =>
  (await admin.from('studies').select().eq('id', id).maybeSingle()).data;

const studyCount = async (ownerId: string) =>
  (
    await admin
      .from('studies')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', ownerId)
  ).count;

const studies = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    name: `Study ${index}`,
    side: 'white',
  }));

it('creates a study owned by the signed-in user', async () => {
  // Given a signed-in user
  const { id, client } = await signedInUser();

  // When they create a study with a name and side
  const { data, error } = await createStudy(client);

  // Then it is theirs, with the id and timestamp filled in
  expect(error).toBeNull();
  expect(data).toEqual({
    id: expect.any(String),
    owner_id: id,
    created_at: expect.any(String),
    ...STUDY,
  });
});

it('lets the owner read, rename and delete their study', async () => {
  // Given a user with a study
  const { client } = await signedInUser();
  const study = await existingStudy(client);

  // When they read it, rename it, then delete it
  const read = await client.from('studies').select().eq('id', study.id);
  const renamed = await client
    .from('studies')
    .update({ name: 'Slav', side: 'white' })
    .eq('id', study.id)
    .select()
    .single();
  const deleted = await client.from('studies').delete().eq('id', study.id);

  // Then each succeeds, and the study is gone
  expect(read.data).toEqual([study]);
  expect(renamed.data).toEqual({ ...study, name: 'Slav', side: 'white' });
  expect(deleted.error).toBeNull();
  expect(await storedStudy(study.id)).toBeNull();
});

it('hides a study from other users, who cannot change or delete it', async () => {
  // Given a study, and a different signed-in user
  const owner = await signedInUser();
  const study = await existingStudy(owner.client);
  const { client } = await signedInUser();

  // When the other user reads, renames and deletes it
  const read = await client.from('studies').select();
  const renamed = await client
    .from('studies')
    .update({ name: 'Mine now' })
    .eq('id', study.id)
    .select();
  const deleted = await client
    .from('studies')
    .delete()
    .eq('id', study.id)
    .select();

  // Then they see nothing, and the study is untouched
  expect(read.data).toEqual([]);
  expect(renamed.data).toEqual([]);
  expect(deleted.data).toEqual([]);
  expect(await storedStudy(study.id)).toEqual(study);
});

it('gives signed-out visitors no access at all', async () => {
  // Given a study, and a signed-out visitor
  const owner = await signedInUser();
  const study = await existingStudy(owner.client);
  const anon = anonClient();

  // When the visitor reads, creates, renames and deletes studies
  const results = await Promise.all([
    anon.from('studies').select(),
    createStudy(anon),
    anon.from('studies').update({ name: 'Mine now' }).eq('id', study.id),
    anon.from('studies').delete().eq('id', study.id),
  ]);

  // Then every request is refused, and the study is untouched
  expect(results.map(({ error }) => error?.code)).toEqual(
    Array(4).fill(PERMISSION_DENIED),
  );
  expect(await storedStudy(study.id)).toEqual(study);
});

it.each([
  ['id', crypto.randomUUID()],
  ['created_at', '2000-01-01T00:00:00+00:00'],
  ['owner_id', crypto.randomUUID()],
])('refuses a client-supplied %s on create', async (column, value) => {
  // Given a signed-in user
  const { client } = await signedInUser();

  // When they create a study supplying the column
  const { error } = await createStudy(client, { ...STUDY, [column]: value });

  // Then it is refused
  expect(error?.code).toBe(PERMISSION_DENIED);
});

it.each([
  ['id', crypto.randomUUID()],
  ['created_at', '2000-01-01T00:00:00+00:00'],
])('refuses a client-supplied %s on update', async (column, value) => {
  // Given a user with a study
  const { client } = await signedInUser();
  const study = await existingStudy(client);

  // When they change the column
  const { error } = await client
    .from('studies')
    .update({ [column]: value })
    .eq('id', study.id);

  // Then it is refused, and the study is untouched
  expect(error?.code).toBe(PERMISSION_DENIED);
  expect(await storedStudy(study.id)).toEqual(study);
});

it('refuses moving a study to another user', async () => {
  // Given a user with a study, and another user
  const { client } = await signedInUser();
  const study = await existingStudy(client);
  const other = await signedInUser();

  // When the owner hands it to the other user
  const { error } = await client
    .from('studies')
    .update({ owner_id: other.id })
    .eq('id', study.id);

  // Then it is refused, and the study stays theirs
  expect(error?.code).toBe(PERMISSION_DENIED);
  expect(await storedStudy(study.id)).toEqual(study);
});

it.each([
  ['an empty name', { name: '' }, CHECK_VIOLATION],
  ['a name with surrounding spaces', { name: ' Caro-Kann ' }, CHECK_VIOLATION],
  ['a 101-character name', { name: 'a'.repeat(101) }, CHECK_VIOLATION],
  ['a missing name', { name: undefined }, NOT_NULL_VIOLATION],
  ['a side other than white or black', { side: 'red' }, CHECK_VIOLATION],
  ['a missing side', { side: undefined }, NOT_NULL_VIOLATION],
])('refuses a study with %s', async (_, change, code) => {
  // Given a signed-in user
  const { client } = await signedInUser();

  // When they create a study with the invalid value
  const { error } = await createStudy(client, { ...STUDY, ...change });

  // Then it is refused
  expect(error?.code).toBe(code);
});

it('accepts a 100-character name', async () => {
  // Given a signed-in user
  const { client } = await signedInUser();

  // When they create a study with a 100-character name
  const { error } = await createStudy(client, {
    ...STUDY,
    name: 'a'.repeat(100),
  });

  // Then it is created
  expect(error).toBeNull();
});

it('refuses a 101st study', async () => {
  // Given a user with 100 studies
  const { id, client } = await signedInUser();
  const seeded = await client.from('studies').insert(studies(100));
  expect(seeded.error).toBeNull();

  // When they create another
  const { error } = await createStudy(client);

  // Then it is refused
  expect(error?.code).toBe(CHECK_VIOLATION);
  expect(await studyCount(id)).toBe(100);
});

it('holds the 100-study cap against concurrent creates', async () => {
  // Given a user with 90 studies
  const { id, client } = await signedInUser();
  const seeded = await client.from('studies').insert(studies(90));
  expect(seeded.error).toBeNull();

  // When they create 20 more at once
  const results = await Promise.all(
    Array.from({ length: 20 }, () => createStudy(client)),
  );

  // Then only enough to reach 100 are created
  expect(results.filter(({ error }) => error === null)).toHaveLength(10);
  expect(await studyCount(id)).toBe(100);
});

it("deletes a user's studies with their account", async () => {
  // Given a user with a study
  const { id, client } = await signedInUser();
  const study = await existingStudy(client);

  // When their account is deleted
  await deleteUser(id);
  userIds.splice(userIds.indexOf(id), 1);

  // Then the study is gone
  expect(await storedStudy(study.id)).toBeNull();
});
