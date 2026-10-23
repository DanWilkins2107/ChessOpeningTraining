import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import {
  admin,
  anonClient,
  deleteUser,
  signedInUser,
} from './tests-shared/testUsers';
import {
  CHECK_VIOLATION,
  PERMISSION_DENIED,
  UNIQUE_VIOLATION,
} from './tests-shared/pgErrorCodes';
import { utcDay } from './tests-shared/utcDay';

const linesOf = (type: string) =>
  Array.from({ length: 10 }, (_, i) => ({ type, i }));
const tenLines = linesOf('full');

const storedTests = async (ownerId: string) =>
  (
    await admin
      .from('daily_tests')
      .select()
      .eq('owner_id', ownerId)
      .order('day')
  ).data;

const notStarted = (
  ownerId: string,
  day = utcDay(),
  lines: unknown = tenLines,
) => ({
  owner_id: ownerId,
  day,
  lines,
  line_index: 0,
  move_index: 0,
  results: [],
  score: null,
});

async function userWithTest(progress: object = {}) {
  const user = await signedInUser();
  const { error } = await admin
    .from('daily_tests')
    .insert({ owner_id: user.id, day: utcDay(), lines: tenLines, ...progress });
  if (error) throw error;
  return user;
}

describe('starting a test', () => {
  it.each([
    ['yesterday', -1],
    ['today', 0],
    ['tomorrow', 1],
  ])("lets the owner start %s's test", async (_, offset) => {
    // Given a signed-in user
    const { id, client } = await signedInUser();

    // When they start a test for that day
    const { error } = await client
      .from('daily_tests')
      .insert({ day: utcDay(offset), lines: tenLines });

    // Then it is stored, not started, as theirs
    expect(error).toBeNull();
    expect(await storedTests(id)).toEqual([notStarted(id, utcDay(offset))]);
  });

  it.each([-2, 2])('refuses a test %i days from today', async (offset) => {
    // Given a signed-in user
    const { id, client } = await signedInUser();

    // When they start a test for that day
    const { error } = await client
      .from('daily_tests')
      .insert({ day: utcDay(offset), lines: tenLines });

    // Then it is refused, and nothing is stored
    expect(error?.code).toBe(PERMISSION_DENIED);
    expect(await storedTests(id)).toEqual([]);
  });

  it.each([
    ['owner_id', crypto.randomUUID()],
    ['line_index', 1],
    ['move_index', 1],
    ['results', [['right']]],
    ['score', 50],
  ])('refuses a client-supplied %s', async (column, value) => {
    // Given a signed-in user
    const { id, client } = await signedInUser();

    // When they start a test supplying that column
    const { error } = await client
      .from('daily_tests')
      .insert({ day: utcDay(), lines: tenLines, [column]: value });

    // Then it is refused, and nothing is stored
    expect(error?.code).toBe(PERMISSION_DENIED);
    expect(await storedTests(id)).toEqual([]);
  });

  it('refuses a second test for the same day', async () => {
    // Given a user who started today's test
    const { id, client } = await userWithTest();

    // When they start another for today
    const { error } = await client
      .from('daily_tests')
      .insert({ day: utcDay(), lines: linesOf('other') });

    // Then it is refused, and the first is untouched
    expect(error?.code).toBe(UNIQUE_VIOLATION);
    expect(await storedTests(id)).toEqual([notStarted(id)]);
  });

  it('refuses a signed-out visitor', async () => {
    // Given a signed-out visitor

    // When they start a test
    const { error } = await anonClient()
      .from('daily_tests')
      .insert({ day: utcDay(), lines: tenLines });

    // Then it is refused
    expect(error?.code).toBe(PERMISSION_DENIED);
  });
});

describe('lines', () => {
  const blankLines = (count: number) =>
    Array.from({ length: count }, () => ({}));
  const paddedLines = (bytes: number) => [
    { pad: 'x'.repeat(bytes) },
    ...blankLines(9),
  ];
  const startTestWith = async (lines: unknown) => {
    const { id, client } = await signedInUser();
    const { error } = await client
      .from('daily_tests')
      .insert({ day: utcDay(), lines });
    return { id, error };
  };

  it.each([
    ['10 lines', blankLines(10)],
    ['just under 256 KB', paddedLines(256 * 1024 - 60)],
  ])('stores %s', async (_, lines) => {
    // When a signed-in user starts a test with those lines
    const { id, error } = await startTestWith(lines);

    // Then it is stored
    expect(error).toBeNull();
    expect(await storedTests(id)).toEqual([notStarted(id, utcDay(), lines)]);
  });

  it.each([
    ['no lines', []],
    ['9 lines', blankLines(9)],
    ['11 lines', blankLines(11)],
    ['256 KB', paddedLines(256 * 1024)],
    ['an object', { type: 'full' }],
    ['a string', 'full'],
  ])('refuses %s', async (_, lines) => {
    // When a signed-in user starts a test with those lines
    const { id, error } = await startTestWith(lines);

    // Then it is refused, and nothing is stored
    expect(error?.code).toBe(CHECK_VIOLATION);
    expect(await storedTests(id)).toEqual([]);
  });
});

describe('progress', () => {
  it('lets the owner record progress', async () => {
    // Given a user who started today's test
    const { id, client } = await userWithTest();
    const progress = {
      line_index: 1,
      move_index: 7,
      results: [['right', 'wrong']],
    };

    // When they record progress
    const { error } = await client
      .from('daily_tests')
      .update(progress)
      .eq('day', utcDay());

    // Then it is stored
    expect(error).toBeNull();
    expect(await storedTests(id)).toEqual([{ ...notStarted(id), ...progress }]);
  });

  it('lets the owner finish the test with a score', async () => {
    // Given a user on the last line of today's test
    const { id, client } = await userWithTest({ line_index: 9 });
    const finish = {
      line_index: 10,
      move_index: 0,
      results: [['right'], ['wrong']],
      score: 50,
    };

    // When they finish it
    const { error } = await client
      .from('daily_tests')
      .update(finish)
      .eq('day', utcDay());

    // Then it is stored as done
    expect(error).toBeNull();
    expect(await storedTests(id)).toEqual([{ ...notStarted(id), ...finish }]);
  });

  it.each([
    ['a line index past the lines', { line_index: 11 }],
    ['a negative line index', { line_index: -1 }],
    ['a move index past 600', { move_index: 601 }],
    ['a negative move index', { move_index: -1 }],
    ['an object of results', { results: { 0: 'right' } }],
    ['64 KB of results', { results: ['x'.repeat(64 * 1024)] }],
    ['a score before every line is finished', { line_index: 9, score: 50 }],
    ['a score over 100', { line_index: 10, score: 101 }],
    ['a negative score', { line_index: 10, score: -1 }],
  ])('refuses %s', async (_, progress) => {
    // Given a user who started today's test
    const { id, client } = await userWithTest();

    // When they record that progress
    const { error } = await client
      .from('daily_tests')
      .update(progress)
      .eq('day', utcDay());

    // Then it is refused, and the test is untouched
    expect(error?.code).toBe(CHECK_VIOLATION);
    expect(await storedTests(id)).toEqual([notStarted(id)]);
  });

  const changeColumn =
    (column: string, value: unknown) => (client: SupabaseClient) =>
      client
        .from('daily_tests')
        .update({ [column]: value })
        .eq('day', utcDay());

  it.each([
    ['change to lines', changeColumn('lines', linesOf('other'))],
    ['change to day', changeColumn('day', utcDay(1))],
    ['change to owner_id', changeColumn('owner_id', crypto.randomUUID())],
    [
      'delete',
      (client: SupabaseClient) =>
        client.from('daily_tests').delete().eq('day', utcDay()),
    ],
  ])('refuses the owner a %s', async (_, request) => {
    // Given a user who started today's test
    const { id, client } = await userWithTest();

    // When they make that request
    const { error } = await request(client);

    // Then it is refused, and the test is untouched
    expect(error?.code).toBe(PERMISSION_DENIED);
    expect(await storedTests(id)).toEqual([notStarted(id)]);
  });

  it('freezes a finished test', async () => {
    // Given a user who finished today's test
    const finished = {
      line_index: 10,
      results: [['right'], ['right']],
      score: 100,
    };
    const { id, client } = await userWithTest(finished);

    // When they change its score
    await client.from('daily_tests').update({ score: 0 }).eq('day', utcDay());

    // Then it is untouched
    expect(await storedTests(id)).toEqual([{ ...notStarted(id), ...finished }]);
  });
});

describe('other users', () => {
  it('hides daily tests from other users', async () => {
    // Given a user who started today's test, and a different signed-in user
    await userWithTest();
    const { client } = await signedInUser();

    // When the other user reads daily tests
    const { data } = await client.from('daily_tests').select();

    // Then they see nothing
    expect(data).toEqual([]);
  });

  it("leaves another user's test untouched", async () => {
    // Given a user who started today's test, and a different signed-in user
    const { id } = await userWithTest();
    const { client } = await signedInUser();

    // When the other user records progress on it
    await client
      .from('daily_tests')
      .update({ move_index: 5 })
      .eq('owner_id', id);

    // Then the owner's test is untouched
    expect(await storedTests(id)).toEqual([notStarted(id)]);
  });

  it('refuses a read by a signed-out visitor', async () => {
    // Given a signed-out visitor

    // When they read daily tests
    const { error } = await anonClient().from('daily_tests').select();

    // Then it is refused
    expect(error?.code).toBe(PERMISSION_DENIED);
  });
});

it("deletes a user's daily tests with their account", async () => {
  // Given a user who started today's test
  const { id } = await userWithTest();

  // When their account is deleted
  await deleteUser(id);

  // Then their daily tests are gone
  expect(await storedTests(id)).toEqual([]);
});
