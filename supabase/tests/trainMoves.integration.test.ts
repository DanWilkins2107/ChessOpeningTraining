import { expect, it } from 'vitest';
import { move } from '../../web/src/tests-shared/moveNode';
import { admin, signedInUser } from './tests-shared/testUsers';
import {
  CHECK_VIOLATION,
  PERMISSION_DENIED,
} from './tests-shared/pgErrorCodes';

const CARO_KANN = [move('e4', move('c6', move('d4'), move('Nc3'))), move('d4')];

const today = () => new Date().toISOString().slice(0, 10);

const daysFromToday = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

type Training = {
  user_id: string;
  tree_ids: string[];
  path: string[];
  confidence_changes: number[];
  day: string;
};

const trainMoves = (training: Training) => admin.rpc('train_moves', training);

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

it('sets confidence along the path, clamped to 0-5 for user moves and 0-2 for opponent moves', async () => {
  const { id, treeId } = await trainedOwner();
  const training = {
    user_id: id,
    tree_ids: [treeId],
    path: ['e4', 'c6', 'd4'],
    day: today(),
  };

  // When the line is trained twice
  await trainMoves({ ...training, confidence_changes: [3, 5, -1] });
  const { data, error } = await trainMoves({
    ...training,
    confidence_changes: [3, -1, 2],
  });

  // Then each move on the path moved within its range, and nothing else changed
  expect(error).toBeNull();
  expect(data).toEqual([]);
  expect(await storedMoves(treeId)).toEqual([
    {
      ...move('e4'),
      confidence: 5,
      children: [
        {
          ...move('c6'),
          confidence: 1,
          children: [{ ...move('d4'), confidence: 2 }, move('Nc3')],
        },
      ],
    },
    move('d4'),
  ]);
});

it('treats the even plies as the user moves in a black move tree', async () => {
  const { id } = await signedInUser();
  const treeId = await ownedMoveTree(id, 'black');

  // When a black line is trained up
  await trainMoves({
    user_id: id,
    tree_ids: [treeId],
    path: ['e4', 'c6'],
    confidence_changes: [5, 5],
    day: today(),
  });

  // Then white's e4 caps at 2 and black's c6 at 5
  const [e4] = await storedMoves(treeId);
  expect([e4.confidence, e4.children[0].confidence]).toEqual([2, 5]);
});

it('skips and returns the move trees that no longer have the path', async () => {
  const { id, treeId } = await trainedOwner();
  const withoutLine = await ownedMoveTree(id, 'white', [move('e4')]);

  // When a line one tree lacks is trained across both
  const { data, error } = await trainMoves({
    user_id: id,
    tree_ids: [treeId, withoutLine],
    path: ['e4', 'c6'],
    confidence_changes: [1, 1],
    day: today(),
  });

  // Then only that tree is skipped, untouched
  expect(error).toBeNull();
  expect(data).toEqual([withoutLine]);
  expect(await storedMoves(withoutLine)).toEqual([move('e4')]);
  expect((await storedMoves(treeId))[0].confidence).toBe(1);
});

it('adds the user moves on the path to the day', async () => {
  const { id, treeId } = await trainedOwner();
  const training = {
    user_id: id,
    tree_ids: [treeId],
    confidence_changes: [1, 1, 1],
    path: ['e4', 'c6', 'd4'],
    day: today(),
  };

  // When the same three-ply white line is trained twice
  await trainMoves(training);
  await trainMoves(training);

  // Then each counts the two white moves
  expect(await movesTrained(id)).toEqual([{ day: today(), moves_trained: 4 }]);
});

it('rejects move trees the user does not own, writing nothing', async () => {
  const { id, treeId } = await trainedOwner();
  const other = await trainedOwner();

  const { error } = await trainMoves({
    user_id: id,
    tree_ids: [treeId, other.treeId],
    path: ['e4'],
    confidence_changes: [1],
    day: today(),
  });

  expect(error?.code).toBe(PERMISSION_DENIED);
  expect(await storedMoves(treeId)).toEqual(CARO_KANN);
  expect(await movesTrained(id)).toEqual([]);
});

it('rejects move trees for different sides', async () => {
  const { id, treeId } = await trainedOwner();
  const blackTree = await ownedMoveTree(id, 'black');

  const { error } = await trainMoves({
    user_id: id,
    tree_ids: [treeId, blackTree],
    path: ['e4'],
    confidence_changes: [1],
    day: today(),
  });

  expect(error?.code).toBe(CHECK_VIOLATION);
});

it.each([
  ['no move trees', { tree_ids: [] }],
  ['an empty path', { path: [], confidence_changes: [] }],
  ['a path over 600 moves', { path: Array(601).fill('e4') }],
  ['fewer changes than moves', { confidence_changes: [] }],
  ['a change over 5', { confidence_changes: [6] }],
  ['a change under -5', { confidence_changes: [-6] }],
  ['a day before yesterday', { day: daysFromToday(-2) }],
  ['a day after tomorrow', { day: daysFromToday(2) }],
])('rejects %s', async (_, invalid) => {
  const { id, treeId } = await trainedOwner();

  const { error } = await trainMoves({
    user_id: id,
    tree_ids: [treeId],
    path: ['e4'],
    confidence_changes: [1],
    day: today(),
    ...invalid,
  });

  expect(error?.code).toBe(CHECK_VIOLATION);
  expect(await storedMoves(treeId)).toEqual(CARO_KANN);
});

it('cannot be called by a signed-in user', async () => {
  const { id, client } = await signedInUser();
  const treeId = await ownedMoveTree(id);

  const { error } = await client.rpc('train_moves', {
    user_id: id,
    tree_ids: [treeId],
    path: ['e4'],
    confidence_changes: [1],
    day: today(),
  });

  expect(error?.code).toBe(PERMISSION_DENIED);
});
