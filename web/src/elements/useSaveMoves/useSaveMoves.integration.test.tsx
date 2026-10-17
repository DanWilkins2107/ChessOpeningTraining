import type { PostgrestError } from '@supabase/supabase-js';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { createQueryClient } from '../createQueryClient/createQueryClient';
import type { MoveNode } from '../MoveNode/MoveNode';
import { MOVES_QUERY_KEY } from '../useMoves/useMoves.constants';
import { isMovesCapError } from '../isMovesCapError/isMovesCapError';
import { leaves, move } from '../../tests-shared/moveNode';
import { spyOnFetch } from '../../tests-shared/spyOnFetch';
import { registerTestUser } from '../../tests-shared/testUser';
import { useSaveMoves } from './useSaveMoves';

const treeOwner = registerTestUser();
const nonOwner = registerTestUser();
const moveTree = { id: '' };

beforeAll(async () => {
  const client = await treeOwner.signedInClient();
  const { data, error } = await client
    .from('move_trees')
    .insert({ name: 'Caro-Kann', side: 'black' })
    .select('id')
    .single();
  if (error) throw error;
  moveTree.id = data.id;
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function renderSaveMovesTestingHarness() {
  const client = createQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <Suspense>{children}</Suspense>
    </QueryClientProvider>
  );
  const { result } = renderHook(() => useSaveMoves(moveTree.id), { wrapper });
  await waitFor(() => expect(result.current).toBeTypeOf('function'));
  return { save: result.current, client };
}

type Save = (moves: MoveNode[]) => Promise<void>;

async function failedSave(save: Save, moves: MoveNode[]) {
  let failure: PostgrestError | undefined;
  await act(() =>
    save(moves).catch((error: PostgrestError) => {
      failure = error;
    }),
  );
  return failure!;
}

const savedMovesQuery = (client: ReturnType<typeof createQueryClient>) =>
  client.getQueryData([MOVES_QUERY_KEY, treeOwner.user.id, moveTree.id]);

async function storedTree() {
  const client = await treeOwner.signedInClient();
  const { data, error } = await client
    .from('move_trees')
    .select('name, side, moves')
    .eq('id', moveTree.id)
    .single();
  if (error) throw error;
  return data;
}

const isMoveTreesRequest = (input: RequestInfo | URL) =>
  String(input).includes('/rest/v1/move_trees');

it('stores the moves as given and leaves the rest of the tree alone', async () => {
  // Given a signed-in tree owner
  await treeOwner.signIn();
  const { save } = await renderSaveMovesTestingHarness();
  const moves = [move('e4', move('c6', move('d4'), move('Nc3')))];

  // When they save moves
  await act(() => save(moves));

  // Then the tree holds exactly those moves, with its name and side unchanged
  expect(await storedTree()).toEqual({
    name: 'Caro-Kann',
    side: 'black',
    moves,
  });
});

it('sends only the moves', async () => {
  // Given a signed-in tree owner
  await treeOwner.signIn();
  const { save } = await renderSaveMovesTestingHarness();
  const fetchSpy = spyOnFetch();

  // When they save moves
  await act(() => save([move('d4')]));

  // Then the update carries the moves and nothing else
  const [, init] = fetchSpy.mock.calls.find(([input]) =>
    isMoveTreesRequest(input),
  )!;
  expect(JSON.parse(String(init?.body))).toEqual({ moves: [move('d4')] });
});

it('puts the saved moves in the moves query', async () => {
  // Given a signed-in tree owner
  await treeOwner.signIn();
  const { save, client } = await renderSaveMovesTestingHarness();
  const moves = [move('c4', move('e5'))];

  // When they save moves
  await act(() => save(moves));

  // Then the moves query for the owner's tree holds them
  expect(savedMovesQuery(client)).toEqual(moves);
});

it('fails as a cap error with the database message over a cap', async () => {
  // Given a signed-in tree owner
  await treeOwner.signIn();
  const { save, client } = await renderSaveMovesTestingHarness();

  // When they save more than 1000 lines
  const failure = await failedSave(save, leaves(1001));

  // Then it fails as a cap error naming the cap, and the query is untouched
  expect(isMovesCapError(failure)).toBe(true);
  expect(failure.message).toBe('Moves can have at most 1000 lines');
  expect(savedMovesQuery(client)).toBeUndefined();
});

it("fails, but not as a cap error, on someone else's tree", async () => {
  // Given a signed-in user who does not own the tree
  await nonOwner.signIn();
  const { save } = await renderSaveMovesTestingHarness();
  const before = await storedTree();

  // When they save moves to it
  const failure = await failedSave(save, [move('f4')]);

  // Then it fails as another error and the tree is unchanged
  expect(isMovesCapError(failure)).toBe(false);
  expect(await storedTree()).toEqual(before);
});
