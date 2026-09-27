import { createClient } from '@supabase/supabase-js';
import { act, screen, within } from '@testing-library/react';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { renderAt } from '../../tests-shared/renderAt';
import { registerTestUser } from '../../tests-shared/testUser';
import { env } from '../../env';

const owner = registerTestUser();
const stranger = registerTestUser();
const branchIds = { london: '', caroKann: '' };

beforeAll(async () => {
  const client = createClient(
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  await owner.signIn(client);
  const { data, error } = await client
    .from('branches')
    .insert([
      { name: 'London', side: 'white' },
      { name: 'Caro-Kann', side: 'black' },
    ])
    .select('id, name');
  if (error) throw error;
  branchIds.london = data.find(({ name }) => name === 'London')!.id;
  branchIds.caroKann = data.find(({ name }) => name === 'Caro-Kann')!.id;
  for (const name of ['Main line', 'Alternatives']) {
    const inserted = await client
      .from('chapters')
      .insert({ branch_id: branchIds.london, name });
    if (inserted.error) throw inserted.error;
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

const isBranchRequest = (input: RequestInfo | URL) =>
  String(input).includes('/rest/v1/branches');

const branchHeading = (name: string) =>
  screen.findByRole('heading', { level: 1, name });

const chapterList = () => screen.queryByRole('list', { name: 'Chapters' });

const loadingBranch = () =>
  screen.queryByRole('status', { name: 'Loading branch' });

function stallBranchRequests() {
  const realFetch = window.fetch;
  // mock-reason: the local server answers too fast to see the loading state
  // in between. Other requests are sent for real.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) =>
    isBranchRequest(input) ? new Promise(() => {}) : realFetch(input, init),
  );
}

it('shows a loading indicator while the user loads', async () => {
  // Given a signed-in owner, whose session the page reads only after it renders
  await owner.signIn();

  // When their branch page renders
  renderAt(`/branches/${branchIds.london}`);

  // Then it shows a loading indicator
  expect(loadingBranch()).toBeInTheDocument();
});

it("shows the branch's name as the page heading", async () => {
  // Given a signed-in owner
  await owner.signIn();

  // When their branch page renders
  renderAt(`/branches/${branchIds.london}`);

  // Then the branch name is the heading, and loading stops
  expect(await branchHeading('London')).toBeInTheDocument();
  expect(loadingBranch()).not.toBeInTheDocument();
});

it("lists the branch's chapters, oldest first", async () => {
  // Given a signed-in owner of a branch with chapters
  await owner.signIn();

  // When their branch page renders
  renderAt(`/branches/${branchIds.london}`);

  // Then it lists the chapter names in the order they were created
  await branchHeading('London');
  expect(
    within(chapterList()!)
      .getAllByRole('listitem')
      .map(({ textContent }) => textContent),
  ).toEqual(['Main line', 'Alternatives']);
});

it('says so when the branch has no chapters', async () => {
  // Given a signed-in owner of a branch without chapters
  await owner.signIn();

  // When their branch page renders
  renderAt(`/branches/${branchIds.caroKann}`);

  // Then it says there are no chapters yet
  await branchHeading('Caro-Kann');
  expect(screen.getByText('No chapters yet')).toBeInTheDocument();
  expect(chapterList()).not.toBeInTheDocument();
});

it('requests the branch once, only once the user has loaded', async () => {
  // Given a signed-in owner not yet loaded
  await owner.signIn();
  // mock-reason: the requests sent are the assertion, and the page shows the
  // same result whether or not an early one went out. Every call is real.
  const fetch = vi.spyOn(window, 'fetch');

  // When their branch page renders and loads
  renderAt(`/branches/${branchIds.london}`);
  await branchHeading('London');

  // Then it requested the branch once, with chapter names oldest first but
  // never their move trees
  const requests = fetch.mock.calls.filter(([input]) => isBranchRequest(input));
  expect(requests).toHaveLength(1);
  const { searchParams } = new URL(String(requests[0][0]));
  expect(searchParams.get('select')).toBe('name,chapters(id,name)');
  expect(searchParams.get('chapters.order')).toBe('created_at.asc,id.asc');
});

it.each([
  ['a branch that does not exist', () => crypto.randomUUID()],
  ["another user's branch", () => branchIds.london],
])('shows not found, asking once, for %s', async (_, branchId) => {
  // Given a signed-in stranger to the branch
  await stranger.signIn();
  // mock-reason: the requests sent are the assertion. Every call is real.
  const fetch = vi.spyOn(window, 'fetch');

  // When they open it
  renderAt(`/branches/${branchId()}`);

  // Then it shows not found, and no chapters, after a single branch request
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Branch not found',
  );
  expect(chapterList()).not.toBeInTheDocument();
  expect(
    fetch.mock.calls.filter(([input]) => isBranchRequest(input)),
  ).toHaveLength(1);
});

it('shows a load error when the request fails', async () => {
  // Given a signed-in owner, and branch requests failing on the server
  await owner.signIn();
  const realFetch = window.fetch;
  // mock-reason: the local server has no way to make this request fail. Other
  // requests are sent for real.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) =>
    isBranchRequest(input)
      ? Promise.resolve(new Response('{}', { status: 500 }))
      : realFetch(input, init),
  );

  // When their branch page renders
  renderAt(`/branches/${branchIds.london}`);

  // Then it shows the load error
  expect(await screen.findByRole('alert')).toHaveTextContent(
    "Couldn't load this branch, try again",
  );
});

it("shows not found, without asking, for an id that isn't a branch id", async () => {
  // Given a signed-in owner
  await owner.signIn();
  // mock-reason: the requests sent are the assertion. Every call is real.
  const fetch = vi.spyOn(window, 'fetch');

  // When they open a malformed branch id
  renderAt('/branches/ab12');

  // Then it shows not found, without requesting the branch
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Branch not found',
  );
  expect(fetch.mock.calls.filter(([input]) => isBranchRequest(input))).toEqual(
    [],
  );
});

it("shows loading, not the previous user's branch, when the user changes", async () => {
  // Given the owner's branch on screen, and branch requests left unanswered
  await owner.signIn();
  renderAt(`/branches/${branchIds.london}`);
  await branchHeading('London');
  stallBranchRequests();

  // When a different user signs in
  await act(() => stranger.signIn());

  // Then it shows loading in place of the owner's branch
  expect(loadingBranch()).toBeInTheDocument();
  expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
});

it('shows loading, not the previous branch, when the branch changes', async () => {
  // Given one branch on screen, and branch requests left unanswered
  await owner.signIn();
  const memoryRouter = renderAt(`/branches/${branchIds.london}`);
  await branchHeading('London');
  stallBranchRequests();

  // When the user moves to another branch
  await act(() => memoryRouter.navigate(`/branches/${branchIds.caroKann}`));

  // Then it shows loading in place of the first branch
  expect(loadingBranch()).toBeInTheDocument();
  expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
});
