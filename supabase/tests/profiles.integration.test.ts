import type { SupabaseClient } from '@supabase/supabase-js';
import { expect, it } from 'vitest';
import {
  admin,
  anonClient,
  deleteUser,
  signedInUser,
} from './tests-shared/testUsers';
import {
  NOT_NULL_VIOLATION,
  PERMISSION_DENIED,
} from './tests-shared/pgErrorCodes';

const saveProfile = (client: SupabaseClient, profile: object) =>
  client
    .from('profiles')
    .upsert(profile, { onConflict: 'user_id' })
    .select()
    .single();

async function existingProfile() {
  const user = await signedInUser();
  const { error } = await saveProfile(user.client, { animate_pieces: false });
  if (error) throw error;
  return user;
}

const storedProfile = async (userId: string) =>
  (await admin.from('profiles').select().eq('user_id', userId).maybeSingle())
    .data;

it('creates a profile for the signed-in user with animation on by default', async () => {
  // Given a signed-in user
  const { id, client } = await signedInUser();

  // When they create a profile without choosing a setting
  const { data, error } = await client
    .from('profiles')
    .insert({})
    .select()
    .single();

  // Then it is theirs, with animation on
  expect(error).toBeNull();
  expect(data).toEqual({ user_id: id, animate_pieces: true });
});

it('saves a first setting and then changes it', async () => {
  // Given a signed-in user with no profile
  const { id, client } = await signedInUser();

  // When they save a setting, then save it again
  await saveProfile(client, { animate_pieces: false });
  const { data, error } = await saveProfile(client, { animate_pieces: true });

  // Then the one profile holds the latest setting
  expect(error).toBeNull();
  expect(data).toEqual({ user_id: id, animate_pieces: true });
  expect(await storedProfile(id)).toEqual(data);
});

it('lets the owner read their profile', async () => {
  // Given a user with a profile
  const { id, client } = await existingProfile();

  // When they read profiles
  const { data } = await client.from('profiles').select();

  // Then they see theirs
  expect(data).toEqual([{ user_id: id, animate_pieces: false }]);
});

it('refuses a missing animate_pieces', async () => {
  // Given a signed-in user
  const { client } = await signedInUser();

  // When they save a null setting
  const { error } = await saveProfile(client, { animate_pieces: null });

  // Then it is refused
  expect(error?.code).toBe(NOT_NULL_VIOLATION);
});

it('refuses a client-supplied user_id on create', async () => {
  // Given a signed-in user, and another user
  const { client } = await signedInUser();
  const other = await signedInUser();

  // When they create a profile for the other user
  const { error } = await client
    .from('profiles')
    .insert({ user_id: other.id, animate_pieces: false });

  // Then it is refused, and the other user has no profile
  expect(error?.code).toBe(PERMISSION_DENIED);
  expect(await storedProfile(other.id)).toBeNull();
});

it('refuses changing a profile’s user_id', async () => {
  // Given a user with a profile, and another user
  const { id, client } = await existingProfile();
  const other = await signedInUser();

  // When they move their profile to the other user
  const { error } = await client
    .from('profiles')
    .update({ user_id: other.id })
    .eq('user_id', id);

  // Then it is refused, and the profile is untouched
  expect(error?.code).toBe(PERMISSION_DENIED);
  expect(await storedProfile(id)).toEqual({
    user_id: id,
    animate_pieces: false,
  });
});

it('refuses the owner deleting their profile', async () => {
  // Given a user with a profile
  const { id, client } = await existingProfile();

  // When they delete it
  const { error } = await client.from('profiles').delete().eq('user_id', id);

  // Then it is refused, and the profile remains
  expect(error?.code).toBe(PERMISSION_DENIED);
  expect(await storedProfile(id)).not.toBeNull();
});

it('hides a profile from other users', async () => {
  // Given a user with a profile, and a different signed-in user
  await existingProfile();
  const { client } = await signedInUser();

  // When the other user reads profiles
  const { data } = await client.from('profiles').select();

  // Then they see nothing
  expect(data).toEqual([]);
});

it('stops other users changing a profile', async () => {
  // Given a user with a profile, and a different signed-in user
  const owner = await existingProfile();
  const { client } = await signedInUser();

  // When the other user changes it
  const { data } = await client
    .from('profiles')
    .update({ animate_pieces: true })
    .eq('user_id', owner.id)
    .select();

  // Then nothing is changed
  expect(data).toEqual([]);
  expect(await storedProfile(owner.id)).toEqual({
    user_id: owner.id,
    animate_pieces: false,
  });
});

it.each([
  ['read', (anon: SupabaseClient) => anon.from('profiles').select()],
  [
    'create',
    (anon: SupabaseClient) =>
      anon.from('profiles').insert({ animate_pieces: false }),
  ],
  [
    'change',
    (anon: SupabaseClient, id: string) =>
      anon.from('profiles').update({ animate_pieces: true }).eq('user_id', id),
  ],
])('refuses a %s by a signed-out visitor', async (_, request) => {
  // Given a user with a profile, and a signed-out visitor
  const owner = await existingProfile();

  // When the visitor makes the request
  const { error } = await request(anonClient(), owner.id);

  // Then it is refused, and the profile is untouched
  expect(error?.code).toBe(PERMISSION_DENIED);
  expect(await storedProfile(owner.id)).toEqual({
    user_id: owner.id,
    animate_pieces: false,
  });
});

it("deletes a user's profile with their account", async () => {
  // Given a user with a profile
  const { id } = await existingProfile();

  // When their account is deleted
  await deleteUser(id);

  // Then the profile is gone
  expect(await storedProfile(id)).toBeNull();
});
