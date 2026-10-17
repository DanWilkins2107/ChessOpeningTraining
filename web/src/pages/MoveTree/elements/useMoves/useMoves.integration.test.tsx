import { render, screen } from '@testing-library/react';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { LoadBoundary } from '../../../../shared/LoadBoundary/LoadBoundary';
import {
  ERROR,
  LOADING,
  LoadError,
  Loading,
} from '../../../../tests-shared/loadStates';
import { move } from '../../../../tests-shared/moveNode';
import { registerTestUser } from '../../../../tests-shared/testUser';
import { withQueryClient } from '../../../../tests-shared/withQueryClient';
import { useMoves } from './useMoves';

const treeOwner = registerTestUser();
const nonOwner = registerTestUser();
const moves = [move('e4', move('c6', move('d4'), move('Nc3')))];
let moveTreeId = '';

// mock-reason: spying only, to see which requests go out. Every request is
// sent for real.
const spyOnFetch = () => vi.spyOn(window, 'fetch');

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

const isMoveTreesRequest = (input: RequestInfo | URL) =>
  String(input).includes('/rest/v1/move_trees');

function Moves() {
  return JSON.stringify(useMoves(moveTreeId));
}

const renderMovesTestingHarness = () =>
  render(
    withQueryClient(
      <LoadBoundary Loading={Loading} LoadError={LoadError}>
        <Moves />
      </LoadBoundary>,
    ),
  );

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
  renderMovesTestingHarness();

  // Then loading fails
  expect(await screen.findByText(ERROR)).toBeInTheDocument();
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
