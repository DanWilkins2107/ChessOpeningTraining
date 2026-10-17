import { createClient } from '@supabase/supabase-js';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { createQueryClient } from '../../../../../elements/createQueryClient/createQueryClient';
import { env } from '../../../../../env';
import { authSettled } from '../../../../../tests-shared/authSettled';
import { move } from '../../../../../tests-shared/moveNode';
import { registerTestUser } from '../../../../../tests-shared/testUser';
import { useMoves } from './useMoves';

const owner = registerTestUser();
const stranger = registerTestUser();
const moves = [move('e4', move('c6', move('d4'), move('Nc3')))];
let moveTreeId = '';

beforeAll(async () => {
  const client = createClient(
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  await owner.signIn(client);
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
  const { status, data } = useMoves(moveTreeId);
  return status === 'success' ? JSON.stringify(data) : status;
}

const renderMovesTestingHarness = () =>
  render(
    <QueryClientProvider client={createQueryClient()}>
      <Moves />
    </QueryClientProvider>,
  );

// mock-reason: spying only, to see which requests go out. Every request is
// sent for real.
const spyOnFetch = () => vi.spyOn(window, 'fetch');

it("loads the owner's moves", async () => {
  // Given a signed-in owner of a tree with moves
  await owner.signIn();

  // When the moves load
  renderMovesTestingHarness();

  // Then they come back as stored
  expect(await screen.findByText(JSON.stringify(moves))).toBeInTheDocument();
});

it('asks for the moves column only', async () => {
  // Given a signed-in owner
  await owner.signIn();
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
  await stranger.signIn();

  // When the moves load
  renderMovesTestingHarness();

  // Then loading fails
  expect(await screen.findByText('error')).toBeInTheDocument();
});

it('stays pending without asking for moves while signed out', async () => {
  // Given no signed-in user
  const fetchSpy = spyOnFetch();

  // When the moves render
  renderMovesTestingHarness();
  await authSettled();

  // Then it is pending and has asked for nothing
  expect(screen.getByText('pending')).toBeInTheDocument();
  expect(fetchSpy.mock.calls.some(([input]) => isMoveTreesRequest(input))).toBe(
    false,
  );
});
