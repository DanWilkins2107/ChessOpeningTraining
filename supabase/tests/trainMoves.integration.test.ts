import postgres from 'postgres';
import { env } from 'node:process';
import { afterAll, expect, it } from 'vitest';
import { move } from '../../web/src/tests-shared/moveNode';
import {
  RejectedTraining,
  trainMoves,
} from '../functions/train-moves/trainMoves';
import { admin, signedInUser } from './tests-shared/testUsers';

const sql = postgres(env.SUPABASE_DB_URL!);
afterAll(() => sql.end());

const CARO_KANN = [move('e4', move('c6', move('d4'), move('Nc3'))), move('d4')];

const todayUtc = () => new Date().toISOString().slice(0, 10);

async function ownedMoveTree(
  ownerId: string,
  side: 'white' | 'black' = 'white',
  moves: object[] = CARO_KANN,
) {
  const { data, error } = await admin
    .from('move_trees')
    .insert({ owner_id: ownerId, name: 'Caro-Kann', side, moves })
    .select()
    .single();
  if (error) throw error;
  return data.id;
}

const storedMoves = async (id: string) =>
  (await admin.from('move_trees').select('moves').eq('id', id).single()).data
    ?.moves;

const movesTrained = async (ownerId: string) =>
  (
    await admin
      .from('training_days')
      .select('day, moves_trained')
      .eq('owner_id', ownerId)
  ).data;

async function trainedOwner() {
  const { id } = await signedInUser();
  return { id, treeId: await ownedMoveTree(id) };
}

const training = (treeIds: string[], path = ['e4', 'c6']) => ({
  treeIds,
  path,
  confidenceChanges: path.map(() => 1),
  day: todayUtc(),
});

it('trains the trees that have the path and skips the rest, untouched', async () => {
  const { id, treeId } = await trainedOwner();
  const withoutLine = await ownedMoveTree(id, 'white', [move('e4')]);

  const skipped = await trainMoves(sql, id, training([treeId, withoutLine]));

  expect(skipped).toEqual([withoutLine]);
  expect(await storedMoves(withoutLine)).toEqual([move('e4')]);
  expect((await storedMoves(treeId))[0].confidence).toBe(1);
});

it('adds the user moves on the path to the day, once however many trees', async () => {
  const { id, treeId } = await trainedOwner();
  const secondTree = await ownedMoveTree(id);
  const line = training([treeId, secondTree], ['e4', 'c6', 'd4']);

  await trainMoves(sql, id, line);
  await trainMoves(sql, id, line);

  expect(await movesTrained(id)).toEqual([
    { day: todayUtc(), moves_trained: 4 },
  ]);
});

it('rejects move trees the user does not own with 403, writing nothing', async () => {
  const { id, treeId } = await trainedOwner();
  const other = await trainedOwner();

  const rejection = trainMoves(sql, id, training([treeId, other.treeId]));

  await expect(rejection).rejects.toThrow(RejectedTraining);
  await expect(rejection).rejects.toMatchObject({ status: 403 });
  expect(await storedMoves(treeId)).toEqual(CARO_KANN);
  expect(await movesTrained(id)).toEqual([]);
});

it('rejects move trees for different sides with 400', async () => {
  const { id, treeId } = await trainedOwner();
  const blackTree = await ownedMoveTree(id, 'black');

  await expect(
    trainMoves(sql, id, training([treeId, blackTree])),
  ).rejects.toMatchObject({ status: 400 });
});
