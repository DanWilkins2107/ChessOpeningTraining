import { act, screen } from '@testing-library/react';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { renderAt } from '../../tests-shared/renderAt';
import { registerTestUser } from '../../tests-shared/testUser';

const moveTreeOwner = registerTestUser();
const otherUser = registerTestUser();
let mainLineId = '';

beforeAll(async () => {
  const client = await moveTreeOwner.signedInClient();
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

const selectOf = (input: RequestInfo | URL) =>
  new URL(String(input)).searchParams.get('select');

const isNameAndSideRequest = (input: RequestInfo | URL) =>
  isMoveTreeRequest(input) && selectOf(input) === 'name,side';

const moveTreeLayout = () =>
  screen.queryByRole('region', { name: 'Move tree' });

const placeholderBoard = () =>
  screen.queryByRole('status', { name: 'Loading board' });

// The board suspends for good, so effects only flush once act is awaited.
async function renderPageAt(path: string) {
  let memoryRouter!: ReturnType<typeof renderAt>;
  await act(async () => {
    memoryRouter = renderAt(path);
  });
  return memoryRouter;
}

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

function failRequests(isFailing: (input: RequestInfo | URL) => boolean) {
  const realFetch = window.fetch;
  // mock-reason: the local server has no way to make these requests fail.
  // Other requests are sent for real.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) =>
    isFailing(input)
      ? Promise.resolve(new Response('{}', { status: 500 }))
      : realFetch(input, init),
  );
}

it('shows the layout with a placeholder board while the move tree loads', async () => {
  // Given a signed-in owner, and move tree requests left unanswered
  await moveTreeOwner.signIn();
  stallMoveTreeRequests();

  // When their move tree page renders
  await renderPageAt(`/tree/${mainLineId}`);

  // Then it shows the layout straight away, with a placeholder board
  expect(moveTreeLayout()).toBeInTheDocument();
  expect(placeholderBoard()).toBeInTheDocument();
});

it('keeps the layout and placeholder board, with no error, once the move tree loads', async () => {
  // Given a signed-in owner
  await moveTreeOwner.signIn();
  const moveTreeRequests = spyOnMoveTreeRequests();

  // When their move tree page renders and the move tree loads
  await renderPageAt(`/tree/${mainLineId}`);
  await moveTreeRequests.answered();

  // Then the layout stays, with the placeholder board and no error
  expect(moveTreeLayout()).toBeInTheDocument();
  expect(placeholderBoard()).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('requests the name and side once, never the moves', async () => {
  // Given a signed-in owner
  await moveTreeOwner.signIn();
  const moveTreeRequests = spyOnMoveTreeRequests();

  // When their move tree page renders and loads
  await renderPageAt(`/tree/${mainLineId}`);
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
  await renderPageAt(`/tree/${moveTreeId()}`);

  // Then it shows not found in place of the layout, after a single request
  // for the name and side
  await vi.waitFor(() =>
    expect(screen.getByRole('alert')).toHaveTextContent('Move tree not found'),
  );
  expect(moveTreeLayout()).not.toBeInTheDocument();
  expect(
    moveTreeRequests
      .requests()
      .filter(({ input }) => isNameAndSideRequest(input)),
  ).toHaveLength(1);
});

it('shows a load error when the request fails', async () => {
  // Given a signed-in owner, and move tree requests failing on the server
  await moveTreeOwner.signIn();
  failRequests(isMoveTreeRequest);

  // When their move tree page renders
  await renderPageAt(`/tree/${mainLineId}`);

  // Then it shows the load error in place of the layout
  await vi.waitFor(() =>
    expect(screen.getByRole('alert')).toHaveTextContent(
      "Couldn't load this move tree, try again",
    ),
  );
  expect(moveTreeLayout()).not.toBeInTheDocument();
});

it("shows not found, without asking, for an id that isn't a move tree id", async () => {
  // Given a signed-in owner
  await moveTreeOwner.signIn();
  const moveTreeRequests = spyOnMoveTreeRequests();

  // When they open a malformed move tree id
  await renderPageAt('/tree/ab12');

  // Then it shows not found, without requesting the move tree
  await vi.waitFor(() =>
    expect(screen.getByRole('alert')).toHaveTextContent('Move tree not found'),
  );
  expect(moveTreeRequests.requests()).toEqual([]);
});

it('asks again, as the new user, when the user changes', async () => {
  // Given the owner's move tree loaded
  await moveTreeOwner.signIn();
  const moveTreeRequests = spyOnMoveTreeRequests();
  await renderPageAt(`/tree/${mainLineId}`);
  await moveTreeRequests.answered();

  // When a different user signs in
  await act(() => otherUser.signIn());

  // Then it shows not found, since the move tree isn't theirs
  await vi.waitFor(() =>
    expect(screen.getByRole('alert')).toHaveTextContent('Move tree not found'),
  );
});

it('asks again when the move tree changes', async () => {
  // Given one move tree loaded
  await moveTreeOwner.signIn();
  const moveTreeRequests = spyOnMoveTreeRequests();
  const memoryRouter = await renderPageAt(`/tree/${mainLineId}`);
  await moveTreeRequests.answered();

  // When the user moves to a move tree that does not exist
  await act(() => memoryRouter.navigate(`/tree/${crypto.randomUUID()}`));

  // Then it shows not found
  await vi.waitFor(() =>
    expect(screen.getByRole('alert')).toHaveTextContent('Move tree not found'),
  );
});
