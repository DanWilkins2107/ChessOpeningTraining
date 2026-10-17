import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { createQueryClient } from '../createQueryClient/createQueryClient';
import { LoadBoundary } from '../../shared/LoadBoundary/LoadBoundary';
import {
  ERROR,
  LOADING,
  LoadError,
  Loading,
} from '../../tests-shared/loadStates';
import { move } from '../../tests-shared/moveNode';
import {
  isMoveTreesRequest,
  spyOnFetch,
} from '../../tests-shared/moveTreesRequests';
import { registerTestUser } from '../../tests-shared/testUser';
import { useMoves } from './useMoves';
import { MOVES_QUERY_KEY } from './useMoves.constants';

const treeOwner = registerTestUser();
const nonOwner = registerTestUser();
const moves = [move('e4', move('c6', move('d4'), move('Nc3')))];
let moveTreeId = '';

beforeAll(async () => {
  const client = await treeOwner.signedInClient();
  const { data, error } = await client
    .from('move_trees')
    .insert({ name: 'Caro-Kann', side: 'black', moves })
    .select('id')
    .single();
  if (error) throw error;
  moveTreeId = data.id;
});

afterEach(() => {
  vi.restoreAllMocks();
});

function Moves() {
  return JSON.stringify(useMoves(moveTreeId));
}

const movesQueryKey = (user: ReturnType<typeof registerTestUser>) => [
  MOVES_QUERY_KEY,
  user.user.id,
  moveTreeId,
];

function renderMovesTestingHarness(client = createQueryClient()) {
  render(
    <QueryClientProvider client={client}>
      <LoadBoundary Loading={Loading} LoadError={LoadError}>
        <Moves />
      </LoadBoundary>
    </QueryClientProvider>,
  );
  return client;
}

it('suspends while the moves load', () => {
  // Given nothing rendered yet

  // When the harness renders
  renderMovesTestingHarness();

  // Then it shows the loading fallback
  expect(screen.getByText(LOADING)).toBeInTheDocument();
});

it("loads the treeOwner's moves", async () => {
  // Given a signed-in treeOwner of a tree with moves
  await treeOwner.signIn();

  // When the moves load
  renderMovesTestingHarness();

  // Then they come back as stored
  expect(await screen.findByText(JSON.stringify(moves))).toBeInTheDocument();
});

it('shows moves already in the moves query', async () => {
  // Given a signed-in treeOwner whose moves query already holds other moves
  await treeOwner.signIn();
  const client = createQueryClient();
  const cached = [move('c4')];
  client.setQueryData(movesQueryKey(treeOwner), cached);

  // When the moves load
  renderMovesTestingHarness(client);

  // Then those moves are shown
  expect(await screen.findByText(JSON.stringify(cached))).toBeInTheDocument();
});

it('asks for the moves column only', async () => {
  // Given a signed-in treeOwner
  await treeOwner.signIn();
  const fetchSpy = spyOnFetch();

  // When the moves load
  renderMovesTestingHarness();
  await screen.findByText(JSON.stringify(moves));

  // Then the request selects only moves
  const [input] = fetchSpy.mock.calls.find(([url]) => isMoveTreesRequest(url))!;
  expect(new URL(String(input)).searchParams.get('select')).toBe('moves');
});

it("fails for someone else's tree", async () => {
  // Given a signed-in user who does not own the tree
  await nonOwner.signIn();

  // When the moves load
  const client = renderMovesTestingHarness();

  // Then loading fails with the database's no-row error
  expect(await screen.findByText(ERROR)).toBeInTheDocument();
  expect(client.getQueryState(movesQueryKey(nonOwner))?.error).toMatchObject({
    code: 'PGRST116',
  });
});

it('fails without asking for moves while signed out', async () => {
  // Given no signed-in user
  const fetchSpy = spyOnFetch();

  // When the moves render
  renderMovesTestingHarness();

  // Then loading fails and nothing was asked for
  expect(await screen.findByText(ERROR)).toBeInTheDocument();
  expect(fetchSpy.mock.calls.some(([input]) => isMoveTreesRequest(input))).toBe(
    false,
  );
});
