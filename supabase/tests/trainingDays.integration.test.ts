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
  PERMISSION_DENIED,
} from './tests-shared/pgErrorCodes';

const today = new Date().toISOString().slice(0, 10);

async function userWhoTrained(moves: number) {
  const user = await signedInUser();
  const { error } = await admin
    .from('training_days')
    .insert({ owner_id: user.id, day: today, moves_trained: moves });
  if (error) throw error;
  return user;
}

const storedDays = async (ownerId: string) =>
  (
    await admin
      .from('training_days')
      .select()
      .eq('owner_id', ownerId)
      .order('day')
  ).data;

it.each([0, 100000])('stores %i moves in a day', async (moves) => {
  // Given a signed-in user
  const { id } = await signedInUser();

  // When the server records that many moves for today
  const { error } = await admin
    .from('training_days')
    .insert({ owner_id: id, day: today, moves_trained: moves });

  // Then it is stored
  expect(error).toBeNull();
  expect(await storedDays(id)).toEqual([
    { owner_id: id, day: today, moves_trained: moves },
  ]);
});

it.each([-1, 100001])('refuses %i moves in a day', async (moves) => {
  // Given a signed-in user
  const { id } = await signedInUser();

  // When the server records that many moves for today
  const { error } = await admin
    .from('training_days')
    .insert({ owner_id: id, day: today, moves_trained: moves });

  // Then it is refused, and nothing is stored
  expect(error?.code).toBe(CHECK_VIOLATION);
  expect(await storedDays(id)).toEqual([]);
});

it('lets the owner read their training days', async () => {
  // Given a user who trained 12 moves today
  const { id, client } = await userWhoTrained(12);

  // When they read training days
  const { data } = await client.from('training_days').select();

  // Then they see theirs
  expect(data).toEqual([{ owner_id: id, day: today, moves_trained: 12 }]);
});

it('hides training days from other users', async () => {
  // Given a user who trained today, and a different signed-in user
  await userWhoTrained(12);
  const { client } = await signedInUser();

  // When the other user reads training days
  const { data } = await client.from('training_days').select();

  // Then they see nothing
  expect(data).toEqual([]);
});

it.each([
  [
    'create',
    (client: SupabaseClient, id: string) =>
      client
        .from('training_days')
        .insert({ owner_id: id, day: '2000-01-01', moves_trained: 5 }),
  ],
  [
    'change',
    (client: SupabaseClient, id: string) =>
      client
        .from('training_days')
        .update({ moves_trained: 50 })
        .eq('owner_id', id),
  ],
  [
    'delete',
    (client: SupabaseClient, id: string) =>
      client.from('training_days').delete().eq('owner_id', id),
  ],
])('refuses the owner a direct %s', async (_, request) => {
  // Given a user who trained 12 moves today
  const { id, client } = await userWhoTrained(12);

  // When they write the table directly
  const { error } = await request(client, id);

  // Then it is refused, and their days are untouched
  expect(error?.code).toBe(PERMISSION_DENIED);
  expect(await storedDays(id)).toEqual([
    { owner_id: id, day: today, moves_trained: 12 },
  ]);
});

it('refuses a read by a signed-out visitor', async () => {
  // Given a signed-out visitor

  // When they read training days
  const { error } = await anonClient().from('training_days').select();

  // Then it is refused
  expect(error?.code).toBe(PERMISSION_DENIED);
});

it("deletes a user's training days with their account", async () => {
  // Given a user who trained today
  const { id } = await userWhoTrained(12);

  // When their account is deleted
  await deleteUser(id);

  // Then their training days are gone
  expect(await storedDays(id)).toEqual([]);
});
