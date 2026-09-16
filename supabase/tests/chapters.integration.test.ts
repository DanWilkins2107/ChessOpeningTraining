import type { SupabaseClient } from '@supabase/supabase-js';
import { env } from 'node:process';
import { expect, it } from 'vitest';
import type { MoveNode } from '../../web/src/elements/moveTree';
import { move } from '../../web/src/tests-shared/move';
import { admin, anonClient, signedInUser } from './tests-shared/testUsers';

const PERMISSION_DENIED = '42501';
const CHECK_VIOLATION = '23514';
const NOT_NULL_VIOLATION = '23502';
const MAX_TREE_BYTES = 512 * 1024;

const TREE = [move('e4', move('c6', move('d4'), move('Nc3')))];

async function existingStudyId(client: SupabaseClient) {
  const { data, error } = await client
    .from('studies')
    .insert({ name: 'Caro-Kann', side: 'black' })
    .select()
    .single();
  if (error) throw error;
  return data.id as string;
}

async function studyOwner() {
  const { client } = await signedInUser();
  return { client, studyId: await existingStudyId(client) };
}

const createChapter = (
  client: SupabaseClient,
  studyId: string,
  chapter: object = {},
) =>
  client
    .from('chapters')
    .insert({ study_id: studyId, name: 'Main line', ...chapter })
    .select()
    .single();

async function existingChapter(client: SupabaseClient, studyId: string) {
  const { data, error } = await createChapter(client, studyId, {
    move_tree: TREE,
  });
  if (error) throw error;
  return data;
}

const storedChapter = async (id: string) =>
  (await admin.from('chapters').select().eq('id', id).maybeSingle()).data;

const chapterCount = async (studyId: string) =>
  (
    await admin
      .from('chapters')
      .select('*', { count: 'exact', head: true })
      .eq('study_id', studyId)
  ).count;

const chapters = (studyId: string, count: number) =>
  Array.from({ length: count }, (_, index) => ({
    study_id: studyId,
    name: `Chapter ${index}`,
  }));

// Node's JSON.stringify recurses per nesting level and overflows its default stack at about 670 plies
// (578 through supabase-js), so deep lines are sent as a prebuilt body. Chromium stringifies 100,000.
async function createChapterWithLine(
  client: SupabaseClient,
  studyId: string,
  plies: number,
) {
  const tree =
    '[{"san":"e4","children":'.repeat(plies) + '[]' + '}]'.repeat(plies);
  const { data } = await client.auth.getSession();
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/chapters`, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${data.session!.access_token}`,
      'Content-Type': 'application/json',
    },
    body: `{"study_id":"${studyId}","name":"Main line","move_tree":${tree}}`,
  });
  return response.ok ? null : ((await response.json()) as { code: string });
}

const leaves = (count: number) =>
  Array.from({ length: count }, (_, index) => move(`m${index}`));

const treeOfTextLength = (bytes: number) => {
  const padding = JSON.stringify([{ san: '', children: [] }]).length + 3;
  return [move('a'.repeat(bytes - padding))];
};

it('creates a chapter with an empty move tree in the owner’s study', async () => {
  // Given a user with a study
  const { client, studyId } = await studyOwner();

  // When they create a chapter with just a name
  const { data, error } = await createChapter(client, studyId);

  // Then it is in their study, with an empty tree and the id and timestamp filled in
  expect(error).toBeNull();
  expect(data).toEqual({
    id: expect.any(String),
    study_id: studyId,
    name: 'Main line',
    move_tree: [],
    created_at: expect.any(String),
  });
});

it('lets the owner read their chapter', async () => {
  // Given a user with a chapter
  const { client, studyId } = await studyOwner();
  const chapter = await existingChapter(client, studyId);

  // When they read it
  const { data } = await client.from('chapters').select().eq('id', chapter.id);

  // Then they see it, move tree included
  expect(data).toEqual([chapter]);
  expect(chapter.move_tree).toEqual(TREE);
});

it('lets the owner rename a chapter and change its move tree', async () => {
  // Given a user with a chapter
  const { client, studyId } = await studyOwner();
  const chapter = await existingChapter(client, studyId);
  const tree = [move('d4', move('d5'))];

  // When they change its name and tree
  const { data } = await client
    .from('chapters')
    .update({ name: 'Sidelines', move_tree: tree })
    .eq('id', chapter.id)
    .select()
    .single();

  // Then the chapter is updated
  expect(data).toEqual({ ...chapter, name: 'Sidelines', move_tree: tree });
});

it.each([
  ['id', async () => crypto.randomUUID()],
  ['created_at', async () => '2000-01-01T00:00:00+00:00'],
  ['study_id', existingStudyId],
])('refuses changing a chapter’s %s', async (column, newValue) => {
  // Given a user with a chapter
  const { client, studyId } = await studyOwner();
  const chapter = await existingChapter(client, studyId);

  // When they change the column
  const { error } = await client
    .from('chapters')
    .update({ [column]: await newValue(client) })
    .eq('id', chapter.id);

  // Then it is refused, and the chapter is untouched
  expect(error?.code).toBe(PERMISSION_DENIED);
  expect(await storedChapter(chapter.id)).toEqual(chapter);
});

it('lets the owner delete their chapter', async () => {
  // Given a user with a chapter
  const { client, studyId } = await studyOwner();
  const chapter = await existingChapter(client, studyId);

  // When they delete it
  const { error } = await client.from('chapters').delete().eq('id', chapter.id);

  // Then the chapter is gone
  expect(error).toBeNull();
  expect(await storedChapter(chapter.id)).toBeNull();
});

it('hides a chapter from other users', async () => {
  // Given a chapter, and a different signed-in user
  const owner = await studyOwner();
  await existingChapter(owner.client, owner.studyId);
  const { client } = await signedInUser();

  // When the other user reads chapters
  const { data } = await client.from('chapters').select();

  // Then they see nothing
  expect(data).toEqual([]);
});

it.each([
  [
    'renaming',
    (other: SupabaseClient, id: string) =>
      other.from('chapters').update({ name: 'Mine now' }).eq('id', id).select(),
  ],
  [
    'deleting',
    (other: SupabaseClient, id: string) =>
      other.from('chapters').delete().eq('id', id).select(),
  ],
])('stops other users %s a chapter', async (_, request) => {
  // Given a chapter, and a different signed-in user
  const owner = await studyOwner();
  const chapter = await existingChapter(owner.client, owner.studyId);
  const { client } = await signedInUser();

  // When the other user makes the request
  const { data } = await request(client, chapter.id);

  // Then nothing is changed, and the chapter is untouched
  expect(data).toEqual([]);
  expect(await storedChapter(chapter.id)).toEqual(chapter);
});

it('refuses a chapter in another user’s study', async () => {
  // Given a study, and a different signed-in user
  const owner = await studyOwner();
  const { client } = await signedInUser();

  // When the other user adds a chapter to it
  const { error } = await createChapter(client, owner.studyId);

  // Then it is refused
  expect(error?.code).toBe(PERMISSION_DENIED);
  expect(await chapterCount(owner.studyId)).toBe(0);
});

it.each([
  ['read', (anon: SupabaseClient) => anon.from('chapters').select()],
  [
    'create',
    (anon: SupabaseClient, chapter: { study_id: string }) =>
      createChapter(anon, chapter.study_id),
  ],
  [
    'rename',
    (anon: SupabaseClient, chapter: { id: string }) =>
      anon.from('chapters').update({ name: 'Mine now' }).eq('id', chapter.id),
  ],
  [
    'delete',
    (anon: SupabaseClient, chapter: { id: string }) =>
      anon.from('chapters').delete().eq('id', chapter.id),
  ],
])('refuses a %s by a signed-out visitor', async (_, request) => {
  // Given a chapter, and a signed-out visitor
  const owner = await studyOwner();
  const chapter = await existingChapter(owner.client, owner.studyId);

  // When the visitor makes the request
  const { error } = await request(anonClient(), chapter);

  // Then it is refused, and the chapter is untouched
  expect(error?.code).toBe(PERMISSION_DENIED);
  expect(await storedChapter(chapter.id)).toEqual(chapter);
});

it.each([
  ['id', crypto.randomUUID()],
  ['created_at', '2000-01-01T00:00:00+00:00'],
])('refuses a client-supplied %s on create', async (column, value) => {
  // Given a user with a study
  const { client, studyId } = await studyOwner();

  // When they create a chapter supplying the column
  const { error } = await createChapter(client, studyId, { [column]: value });

  // Then it is refused
  expect(error?.code).toBe(PERMISSION_DENIED);
});

it.each([
  ['an empty name', { name: '' }, CHECK_VIOLATION],
  ['a name with surrounding spaces', { name: ' Main line ' }, CHECK_VIOLATION],
  ['a 101-character name', { name: 'a'.repeat(101) }, CHECK_VIOLATION],
  ['a missing name', { name: undefined }, NOT_NULL_VIOLATION],
  ['a null move tree', { move_tree: null }, NOT_NULL_VIOLATION],
  ['a move tree that is not an array', { move_tree: {} }, CHECK_VIOLATION],
  ['a move that is not an object', { move_tree: ['e4'] }, CHECK_VIOLATION],
  ['a null move', { move_tree: [null] }, CHECK_VIOLATION],
  ['a move without a san', { move_tree: [{ children: [] }] }, CHECK_VIOLATION],
  [
    'a move whose san is not a string',
    { move_tree: [{ san: 4, children: [] }] },
    CHECK_VIOLATION,
  ],
  ['a move without children', { move_tree: [{ san: 'e4' }] }, CHECK_VIOLATION],
  [
    'a move whose children are not an array',
    { move_tree: [{ san: 'e4', children: {} }] },
    CHECK_VIOLATION,
  ],
  [
    'a move with an extra key',
    { move_tree: [{ ...move('e4'), comment: 'Best by test' }] },
    CHECK_VIOLATION,
  ],
  [
    'an invalid move deep in a variation',
    { move_tree: [move('e4', move('c6', { san: 'd4' } as MoveNode))] },
    CHECK_VIOLATION,
  ],
  ['1001 lines at one ply', { move_tree: leaves(1001) }, CHECK_VIOLATION],
  [
    '1001 lines ending at different plies',
    { move_tree: [...leaves(600), move('d4', ...leaves(401))] },
    CHECK_VIOLATION,
  ],
  [
    'a move tree over 512 KB',
    { move_tree: treeOfTextLength(MAX_TREE_BYTES + 1) },
    CHECK_VIOLATION,
  ],
])('refuses a chapter with %s', async (_, change, code) => {
  // Given a user with a study
  const { client, studyId } = await studyOwner();

  // When they create a chapter with the invalid value
  const { error } = await createChapter(client, studyId, change);

  // Then it is refused
  expect(error?.code).toBe(code);
});

it.each([
  ['a 100-character name', { name: 'a'.repeat(100) }],
  ['1000 lines at one ply', { move_tree: leaves(1000) }],
  [
    '1000 lines ending at different plies',
    { move_tree: [...leaves(600), move('d4', ...leaves(400))] },
  ],
  [
    'a move tree of exactly 512 KB',
    { move_tree: treeOfTextLength(MAX_TREE_BYTES) },
  ],
])('accepts a chapter with %s', async (_, change) => {
  // Given a user with a study
  const { client, studyId } = await studyOwner();

  // When they create a chapter with the value at its limit
  const { error } = await createChapter(client, studyId, change);

  // Then it is created
  expect(error).toBeNull();
});

it('accepts a 600-ply line', async () => {
  // Given a user with a study
  const { client, studyId } = await studyOwner();

  // When they create a chapter whose tree is one 600-ply line
  const error = await createChapterWithLine(client, studyId, 600);

  // Then it is created
  expect(error).toBeNull();
});

it.each([601, 5000])('refuses a %i-ply line', async (plies) => {
  // Given a user with a study
  const { client, studyId } = await studyOwner();

  // When they create a chapter whose tree is one line that long
  const error = await createChapterWithLine(client, studyId, plies);

  // Then it is refused
  expect(error?.code).toBe(CHECK_VIOLATION);
  expect(await chapterCount(studyId)).toBe(0);
});

it('refuses changing a move tree to an invalid one', async () => {
  // Given a user with a chapter
  const { client, studyId } = await studyOwner();
  const chapter = await existingChapter(client, studyId);

  // When they change its tree to an invalid one
  const { error } = await client
    .from('chapters')
    .update({ move_tree: [{ san: 'd4' }] })
    .eq('id', chapter.id);

  // Then it is refused, and the chapter is untouched
  expect(error?.code).toBe(CHECK_VIOLATION);
  expect(await storedChapter(chapter.id)).toEqual(chapter);
});

it('refuses a 101st chapter in a study', async () => {
  // Given a study with 100 chapters
  const { client, studyId } = await studyOwner();
  const seeded = await client.from('chapters').insert(chapters(studyId, 100));
  expect(seeded.error).toBeNull();

  // When the owner creates another
  const { error } = await createChapter(client, studyId);

  // Then it is refused
  expect(error?.code).toBe(CHECK_VIOLATION);
  expect(await chapterCount(studyId)).toBe(100);
});

it('holds the 100-chapter cap against concurrent creates', async () => {
  // Given a study with 90 chapters
  const { client, studyId } = await studyOwner();
  const seeded = await client.from('chapters').insert(chapters(studyId, 90));
  expect(seeded.error).toBeNull();

  // When the owner creates 20 more at once
  const results = await Promise.all(
    Array.from({ length: 20 }, () => createChapter(client, studyId)),
  );

  // Then only enough to reach 100 are created
  expect(results.filter(({ error }) => error === null)).toHaveLength(10);
  expect(await chapterCount(studyId)).toBe(100);
});

it('deletes a study’s chapters with the study', async () => {
  // Given a user with a chapter
  const { client, studyId } = await studyOwner();
  const chapter = await existingChapter(client, studyId);

  // When they delete the study
  const { error } = await client.from('studies').delete().eq('id', studyId);

  // Then the chapter is gone
  expect(error).toBeNull();
  expect(await storedChapter(chapter.id)).toBeNull();
});
