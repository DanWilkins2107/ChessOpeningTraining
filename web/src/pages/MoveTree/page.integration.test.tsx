import { createClient } from '@supabase/supabase-js';
import { act, screen } from '@testing-library/react';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { renderAt } from '../../tests-shared/renderAt';
import { registerTestUser } from '../../tests-shared/testUser';
import { env } from '../../env';

const owner = registerTestUser();
const stranger = registerTestUser();
const moveTreeIds = { mainLine: '', alternatives: '' };

beforeAll(async () => {
  const client = createClient(
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  await owner.signIn(client);
  const { data, error } = await client
    .from('move_trees')
    .insert([
      { name: 'Main line', side: 'black' },
      { name: 'Alternatives', side: 'white' },
    ])
    .select('id, name');
  if (error) throw error;
  moveTreeIds.mainLine = data.find(({ name }) => name === 'Main line')!.id;
  moveTreeIds.alternatives = data.find(
    ({ name }) => name === 'Alternatives',
  )!.id;
});

afterEach(() => {
  vi.restoreAllMocks();
});

const isMoveTreeRequest = (input: RequestInfo | URL) =>
  String(input).includes('/rest/v1/move_trees');

const moveTreeLayout = (busy: boolean) =>
  screen.queryByRole('region', { name: 'Move tree', busy });

const loadedLayout = () =>
  screen.findByRole('region', { name: 'Move tree', busy: false });

function stallMoveTreeRequests() {
  const realFetch = window.fetch;
  // mock-reason: the local server answers too fast to see the loading state
  // in between. Other requests are sent for real.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) =>
    isMoveTreeRequest(input) ? new Promise(() => {}) : realFetch(input, init),
  );
}

it('shows the layout as busy while the user loads', async () => {
  // Given a signed-in owner, whose session the page reads only after it renders
  await owner.signIn();

  // When their move tree page renders
  renderAt(`/tree/${moveTreeIds.mainLine}`);

  // Then it shows the layout, marked busy
  expect(moveTreeLayout(true)).toBeInTheDocument();
});

it('shows the layout, no longer busy, once the move tree loads', async () => {
  // Given a signed-in owner
  await owner.signIn();

  // When their move tree page renders
  renderAt(`/tree/${moveTreeIds.mainLine}`);

  // Then the layout stops being busy, with no error
  expect(await loadedLayout()).toBeInTheDocument();
  expect(moveTreeLayout(true)).not.toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('requests the name and side once, never the moves', async () => {
  // Given a signed-in owner not yet loaded
  await owner.signIn();
  // mock-reason: the requests sent are the assertion, and the page shows the
  // same result whether or not an early one went out. Every call is real.
  const fetch = vi.spyOn(window, 'fetch');

  // When their move tree page renders and loads
  renderAt(`/tree/${moveTreeIds.mainLine}`);
  await loadedLayout();

  // Then it requested the move tree once, for its name and side alone
  const requests = fetch.mock.calls.filter(([input]) =>
    isMoveTreeRequest(input),
  );
  expect(requests).toHaveLength(1);
  const { searchParams } = new URL(String(requests[0][0]));
  expect(searchParams.get('select')).toBe('name,side');
  expect(searchParams.get('id')).toBe(`eq.${moveTreeIds.mainLine}`);
});

it.each([
  ['a move tree that does not exist', () => crypto.randomUUID()],
  ["another user's move tree", () => moveTreeIds.mainLine],
])('shows not found, asking once, for %s', async (_, moveTreeId) => {
  // Given a signed-in stranger to the move tree
  await stranger.signIn();
  // mock-reason: the requests sent are the assertion. Every call is real.
  const fetch = vi.spyOn(window, 'fetch');

  // When they open it
  renderAt(`/tree/${moveTreeId()}`);

  // Then it shows not found in place of the layout, after a single request
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Move tree not found',
  );
  expect(moveTreeLayout(false)).not.toBeInTheDocument();
  expect(
    fetch.mock.calls.filter(([input]) => isMoveTreeRequest(input)),
  ).toHaveLength(1);
});

it('shows a load error when the request fails', async () => {
  // Given a signed-in owner, and move tree requests failing on the server
  await owner.signIn();
  const realFetch = window.fetch;
  // mock-reason: the local server has no way to make this request fail. Other
  // requests are sent for real.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) =>
    isMoveTreeRequest(input)
      ? Promise.resolve(new Response('{}', { status: 500 }))
      : realFetch(input, init),
  );

  // When their move tree page renders
  renderAt(`/tree/${moveTreeIds.mainLine}`);

  // Then it shows the load error in place of the layout
  expect(await screen.findByRole('alert')).toHaveTextContent(
    "Couldn't load this move tree, try again",
  );
  expect(moveTreeLayout(false)).not.toBeInTheDocument();
});

it("shows not found, without asking, for an id that isn't a move tree id", async () => {
  // Given a signed-in owner
  await owner.signIn();
  // mock-reason: the requests sent are the assertion. Every call is real.
  const fetch = vi.spyOn(window, 'fetch');

  // When they open a malformed move tree id
  renderAt('/tree/ab12');

  // Then it shows not found, without requesting the move tree
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Move tree not found',
  );
  expect(
    fetch.mock.calls.filter(([input]) => isMoveTreeRequest(input)),
  ).toEqual([]);
});

it('shows the layout as busy again when the user changes', async () => {
  // Given the owner's move tree loaded, and move tree requests left unanswered
  await owner.signIn();
  renderAt(`/tree/${moveTreeIds.mainLine}`);
  await loadedLayout();
  stallMoveTreeRequests();

  // When a different user signs in
  await act(() => stranger.signIn());

  // Then the layout is busy again
  expect(moveTreeLayout(true)).toBeInTheDocument();
});

it('shows the layout as busy again when the move tree changes', async () => {
  // Given one move tree loaded, and move tree requests left unanswered
  await owner.signIn();
  const memoryRouter = renderAt(`/tree/${moveTreeIds.mainLine}`);
  await loadedLayout();
  stallMoveTreeRequests();

  // When the user moves to another move tree
  await act(() => memoryRouter.navigate(`/tree/${moveTreeIds.alternatives}`));

  // Then the layout is busy again
  expect(moveTreeLayout(true)).toBeInTheDocument();
});
