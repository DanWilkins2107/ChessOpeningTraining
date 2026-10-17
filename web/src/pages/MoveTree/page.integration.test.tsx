import { createClient } from '@supabase/supabase-js';
import { act, screen } from '@testing-library/react';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { renderAt } from '../../tests-shared/renderAt';
import { registerTestUser } from '../../tests-shared/testUser';
import { env } from '../../env';

const moveTreeOwner = registerTestUser();
const otherUser = registerTestUser();
let mainLineId = '';

beforeAll(async () => {
  const client = createClient(
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  await moveTreeOwner.signIn(client);
  const { data, error } = await client
    .from('move_trees')
    .insert({ name: 'Main line', side: 'black' })
    .select('id')
    .single();
  if (error) throw error;
  mainLineId = data.id;
});

afterEach(() => {
  vi.restoreAllMocks();
});

const isMoveTreeRequest = (input: RequestInfo | URL) =>
  String(input).includes('/rest/v1/move_trees');

const moveTreeLayout = () =>
  screen.queryByRole('region', { name: 'Move tree' });

const placeholderBoard = () =>
  screen.queryByRole('status', { name: 'Loading board' });

function spyOnMoveTreeRequests() {
  // mock-reason: the requests sent are the assertion. Every call is real.
  const fetch = vi.spyOn(window, 'fetch');
  const requests = () =>
    fetch.mock.calls.flatMap(([input], index) =>
      isMoveTreeRequest(input) ? [{ input, index }] : [],
    );
  return {
    requests,
    async answered() {
      await vi.waitFor(() => expect(requests()).not.toEqual([]));
      await act(() =>
        Promise.all(
          requests().map(({ index }) => fetch.mock.results[index]!.value),
        ),
      );
    },
  };
}

function stallMoveTreeRequests() {
  const realFetch = window.fetch;
  // mock-reason: the local server answers too fast to see the loading state
  // in between. Other requests are sent for real.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) =>
    isMoveTreeRequest(input) ? new Promise(() => {}) : realFetch(input, init),
  );
}

it('shows the layout with a placeholder board while the move tree loads', async () => {
  // Given a signed-in owner, and move tree requests left unanswered
  await moveTreeOwner.signIn();
  stallMoveTreeRequests();

  // When their move tree page renders
  renderAt(`/tree/${mainLineId}`);

  // Then it shows the layout straight away, with a placeholder board
  expect(moveTreeLayout()).toBeInTheDocument();
  expect(placeholderBoard()).toBeInTheDocument();
});

it('keeps the layout, with no error, once the move tree loads', async () => {
  // Given a signed-in owner
  await moveTreeOwner.signIn();
  const moveTreeRequests = spyOnMoveTreeRequests();

  // When their move tree page renders and the move tree loads
  renderAt(`/tree/${mainLineId}`);
  await moveTreeRequests.answered();

  // Then the layout stays, with no error
  expect(moveTreeLayout()).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('requests the name and side once, never the moves', async () => {
  // Given a signed-in owner
  await moveTreeOwner.signIn();
  const moveTreeRequests = spyOnMoveTreeRequests();

  // When their move tree page renders and loads
  renderAt(`/tree/${mainLineId}`);
  await moveTreeRequests.answered();

  // Then it requested the move tree once, for its name and side alone
  const [{ input }, ...later] = moveTreeRequests.requests();
  expect(later).toEqual([]);
  expect(Object.fromEntries(new URL(String(input)).searchParams)).toEqual({
    select: 'name,side',
    id: `eq.${mainLineId}`,
  });
});

it.each([
  ['a move tree that does not exist', () => crypto.randomUUID()],
  ["another user's move tree", () => mainLineId],
])('shows not found, asking once, for %s', async (_, moveTreeId) => {
  // Given a signed-in stranger to the move tree
  await otherUser.signIn();
  const moveTreeRequests = spyOnMoveTreeRequests();

  // When they open it
  renderAt(`/tree/${moveTreeId()}`);

  // Then it shows not found in place of the layout, after a single request
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Move tree not found',
  );
  expect(moveTreeLayout()).not.toBeInTheDocument();
  expect(moveTreeRequests.requests()).toHaveLength(1);
});

it('shows a load error when the request fails', async () => {
  // Given a signed-in owner, and move tree requests failing on the server
  await moveTreeOwner.signIn();
  const realFetch = window.fetch;
  // mock-reason: the local server has no way to make this request fail. Other
  // requests are sent for real.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) =>
    isMoveTreeRequest(input)
      ? Promise.resolve(new Response('{}', { status: 500 }))
      : realFetch(input, init),
  );

  // When their move tree page renders
  renderAt(`/tree/${mainLineId}`);

  // Then it shows the load error in place of the layout
  expect(await screen.findByRole('alert')).toHaveTextContent(
    "Couldn't load this move tree, try again",
  );
  expect(moveTreeLayout()).not.toBeInTheDocument();
});

it("shows not found, without asking, for an id that isn't a move tree id", async () => {
  // Given a signed-in owner
  await moveTreeOwner.signIn();
  const moveTreeRequests = spyOnMoveTreeRequests();

  // When they open a malformed move tree id
  renderAt('/tree/ab12');

  // Then it shows not found, without requesting the move tree
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Move tree not found',
  );
  expect(moveTreeRequests.requests()).toEqual([]);
});

it('asks again, as the new user, when the user changes', async () => {
  // Given the owner's move tree loaded
  await moveTreeOwner.signIn();
  const moveTreeRequests = spyOnMoveTreeRequests();
  renderAt(`/tree/${mainLineId}`);
  await moveTreeRequests.answered();

  // When a different user signs in
  await act(() => otherUser.signIn());

  // Then it shows not found, since the move tree isn't theirs
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Move tree not found',
  );
});

it('asks again when the move tree changes', async () => {
  // Given one move tree loaded
  await moveTreeOwner.signIn();
  const moveTreeRequests = spyOnMoveTreeRequests();
  const memoryRouter = renderAt(`/tree/${mainLineId}`);
  await moveTreeRequests.answered();

  // When the user moves to a move tree that does not exist
  await act(() => memoryRouter.navigate(`/tree/${crypto.randomUUID()}`));

  // Then it shows not found
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Move tree not found',
  );
});
