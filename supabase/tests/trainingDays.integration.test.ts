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

const DAY_MS = 24 * 60 * 60 * 1000;

const utcDaysFromToday = (days: number) =>
  new Date(Date.now() + days * DAY_MS).toISOString().slice(0, 10);

const today = utcDaysFromToday(0);

const recordTrainedMoves = (
  client: SupabaseClient,
  day: string,
  moves: number,
) => client.rpc('record_trained_moves', { day, moves });

async function userWhoTrained(moves: number) {
  const user = await signedInUser();
  const { error } = await recordTrainedMoves(user.client, today, moves);
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

it('records moves trained today for the signed-in user', async () => {
  // Given a signed-in user
  const { id, client } = await signedInUser();

  // When they record 12 moves for today
  const { error } = await recordTrainedMoves(client, today, 12);

  // Then today holds 12 moves, owned by them
  expect(error).toBeNull();
  expect(await storedDays(id)).toEqual([
    { owner_id: id, day: today, moves_trained: 12 },
  ]);
});

it('adds to moves already recorded that day', async () => {
  // Given a user who trained 12 moves today
  const { id, client } = await userWhoTrained(12);

  // When they record 5 more
  await recordTrainedMoves(client, today, 5);

  // Then today holds 17 moves
  expect(await storedDays(id)).toEqual([
    { owner_id: id, day: today, moves_trained: 17 },
  ]);
});

it('keeps every move when recorded from several tabs at once', async () => {
  // Given a signed-in user
  const { id, client } = await signedInUser();

  // When 20 recordings of 3 moves land at the same time
  const results = await Promise.all(
    Array.from({ length: 20 }, () => recordTrainedMoves(client, today, 3)),
  );

  // Then all 60 moves are kept
  expect(results.map((result) => result.error)).toEqual(Array(20).fill(null));
  expect(await storedDays(id)).toEqual([
    { owner_id: id, day: today, moves_trained: 60 },
  ]);
});

it.each([
  ['yesterday', -1],
  ['tomorrow', 1],
])('accepts %s in UTC, as some timezone’s today', async (_, offset) => {
  // Given a signed-in user
  const { id, client } = await signedInUser();
  const day = utcDaysFromToday(offset);

  // When they record moves for that day
  const { error } = await recordTrainedMoves(client, day, 4);

  // Then it is recorded
  expect(error).toBeNull();
  expect(await storedDays(id)).toEqual([
    { owner_id: id, day, moves_trained: 4 },
  ]);
});

it.each([
  ['two days ago', -2],
  ['two days ahead', 2],
])('refuses a day %s in UTC', async (_, offset) => {
  // Given a signed-in user
  const { id, client } = await signedInUser();

  // When they record moves for that day
  const { error } = await recordTrainedMoves(
    client,
    utcDaysFromToday(offset),
    4,
  );

  // Then it is refused, and nothing is recorded
  expect(error?.code).toBe(CHECK_VIOLATION);
  expect(await storedDays(id)).toEqual([]);
});

it.each([1, 1000])('accepts %i moves in one call', async (moves) => {
  // Given a signed-in user
  const { id, client } = await signedInUser();

  // When they record that many moves
  const { error } = await recordTrainedMoves(client, today, moves);

  // Then it is recorded
  expect(error).toBeNull();
  expect(await storedDays(id)).toEqual([
    { owner_id: id, day: today, moves_trained: moves },
  ]);
});

it.each([0, -1, 1001])('refuses %i moves in one call', async (moves) => {
  // Given a signed-in user
  const { id, client } = await signedInUser();

  // When they record that many moves
  const { error } = await recordTrainedMoves(client, today, moves);

  // Then it is refused, and nothing is recorded
  expect(error?.code).toBe(CHECK_VIOLATION);
  expect(await storedDays(id)).toEqual([]);
});

it('refuses taking a day past 100000 moves', async () => {
  // Given a user on 99999 moves today
  const { id, client } = await signedInUser();
  const seeded = await admin
    .from('training_days')
    .insert({ owner_id: id, day: today, moves_trained: 99999 });
  expect(seeded.error).toBeNull();

  // When they record 2 more
  const { error } = await recordTrainedMoves(client, today, 2);

  // Then it is refused, and the day is untouched
  expect(error?.code).toBe(CHECK_VIOLATION);
  expect(await storedDays(id)).toEqual([
    { owner_id: id, day: today, moves_trained: 99999 },
  ]);
});

it('records only on the caller’s own row', async () => {
  // Given a user who trained 12 moves today
  const owner = await userWhoTrained(12);
  const other = await signedInUser();

  // When another user records moves for today
  await recordTrainedMoves(other.client, today, 5);

  // Then each has their own day
  expect(await storedDays(owner.id)).toEqual([
    { owner_id: owner.id, day: today, moves_trained: 12 },
  ]);
  expect(await storedDays(other.id)).toEqual([
    { owner_id: other.id, day: today, moves_trained: 5 },
  ]);
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
    (client: SupabaseClient) =>
      client.from('training_days').insert({ day: today, moves_trained: 5 }),
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

  // Then it is refused, and their day is untouched
  expect(error?.code).toBe(PERMISSION_DENIED);
  expect(await storedDays(id)).toEqual([
    { owner_id: id, day: today, moves_trained: 12 },
  ]);
});

it.each([
  ['read', (anon: SupabaseClient) => anon.from('training_days').select()],
  ['record', (anon: SupabaseClient) => recordTrainedMoves(anon, today, 5)],
])('refuses a %s by a signed-out visitor', async (_, request) => {
  // Given a signed-out visitor

  // When they make the request
  const { error } = await request(anonClient());

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
