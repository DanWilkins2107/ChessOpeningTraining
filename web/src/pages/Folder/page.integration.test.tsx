import { createClient } from '@supabase/supabase-js';
import { act, screen, within } from '@testing-library/react';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { renderAt } from '../../tests-shared/renderAt';
import { registerTestUser } from '../../tests-shared/testUser';
import { env } from '../../env';

const owner = registerTestUser();
const stranger = registerTestUser();
const folderIds = { london: '', caroKann: '' };

beforeAll(async () => {
  const client = createClient(
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  await owner.signIn(client);
  const { data, error } = await client
    .from('folders')
    .insert([
      { name: 'London', side: 'white' },
      { name: 'Caro-Kann', side: 'black' },
    ])
    .select('id, name');
  if (error) throw error;
  folderIds.london = data.find(({ name }) => name === 'London')!.id;
  folderIds.caroKann = data.find(({ name }) => name === 'Caro-Kann')!.id;
  for (const name of ['Main line', 'Alternatives']) {
    const inserted = await client
      .from('chapters')
      .insert({ folder_id: folderIds.london, name });
    if (inserted.error) throw inserted.error;
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

const isFolderRequest = (input: RequestInfo | URL) =>
  String(input).includes('/rest/v1/folders');

const folderHeading = (name: string) =>
  screen.findByRole('heading', { level: 1, name });

const chapterList = () => screen.queryByRole('list', { name: 'Chapters' });

const loadingFolder = () =>
  screen.queryByRole('status', { name: 'Loading folder' });

function stallFolderRequests() {
  const realFetch = window.fetch;
  // mock-reason: the local server answers too fast to see the loading state
  // in between. Other requests are sent for real.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) =>
    isFolderRequest(input) ? new Promise(() => {}) : realFetch(input, init),
  );
}

it('shows a loading indicator while the user loads', async () => {
  // Given a signed-in owner, whose session the page reads only after it renders
  await owner.signIn();

  // When their folder page renders
  renderAt(`/folders/${folderIds.london}`);

  // Then it shows a loading indicator
  expect(loadingFolder()).toBeInTheDocument();
});

it("shows the folder's name as the page heading", async () => {
  // Given a signed-in owner
  await owner.signIn();

  // When their folder page renders
  renderAt(`/folders/${folderIds.london}`);

  // Then the folder name is the heading, and loading stops
  expect(await folderHeading('London')).toBeInTheDocument();
  expect(loadingFolder()).not.toBeInTheDocument();
});

it("lists the folder's chapters, oldest first", async () => {
  // Given a signed-in owner of a folder with chapters
  await owner.signIn();

  // When their folder page renders
  renderAt(`/folders/${folderIds.london}`);

  // Then it lists the chapter names in the order they were created
  await folderHeading('London');
  expect(
    within(chapterList()!)
      .getAllByRole('listitem')
      .map(({ textContent }) => textContent),
  ).toEqual(['Main line', 'Alternatives']);
});

it('says so when the folder has no chapters', async () => {
  // Given a signed-in owner of a folder without chapters
  await owner.signIn();

  // When their folder page renders
  renderAt(`/folders/${folderIds.caroKann}`);

  // Then it says there are no chapters yet
  await folderHeading('Caro-Kann');
  expect(screen.getByText('No chapters yet')).toBeInTheDocument();
  expect(chapterList()).not.toBeInTheDocument();
});

it('requests the folder once, only once the user has loaded', async () => {
  // Given a signed-in owner not yet loaded
  await owner.signIn();
  // mock-reason: the requests sent are the assertion, and the page shows the
  // same result whether or not an early one went out. Every call is real.
  const fetch = vi.spyOn(window, 'fetch');

  // When their folder page renders and loads
  renderAt(`/folders/${folderIds.london}`);
  await folderHeading('London');

  // Then it requested the folder once, with chapter names oldest first but
  // never their move trees
  const requests = fetch.mock.calls.filter(([input]) => isFolderRequest(input));
  expect(requests).toHaveLength(1);
  const { searchParams } = new URL(String(requests[0][0]));
  expect(searchParams.get('select')).toBe('name,chapters(id,name)');
  expect(searchParams.get('chapters.order')).toBe('created_at.asc,id.asc');
});

it.each([
  ['a folder that does not exist', () => crypto.randomUUID()],
  ["another user's folder", () => folderIds.london],
])('shows not found, asking once, for %s', async (_, folderId) => {
  // Given a signed-in stranger to the folder
  await stranger.signIn();
  // mock-reason: the requests sent are the assertion. Every call is real.
  const fetch = vi.spyOn(window, 'fetch');

  // When they open it
  renderAt(`/folders/${folderId()}`);

  // Then it shows not found, and no chapters, after a single folder request
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Folder not found',
  );
  expect(chapterList()).not.toBeInTheDocument();
  expect(
    fetch.mock.calls.filter(([input]) => isFolderRequest(input)),
  ).toHaveLength(1);
});

it('shows a load error when the request fails', async () => {
  // Given a signed-in owner, and folder requests failing on the server
  await owner.signIn();
  const realFetch = window.fetch;
  // mock-reason: the local server has no way to make this request fail. Other
  // requests are sent for real.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) =>
    isFolderRequest(input)
      ? Promise.resolve(new Response('{}', { status: 500 }))
      : realFetch(input, init),
  );

  // When their folder page renders
  renderAt(`/folders/${folderIds.london}`);

  // Then it shows the load error
  expect(await screen.findByRole('alert')).toHaveTextContent(
    "Couldn't load this folder, try again",
  );
});

it("shows not found, without asking, for an id that isn't a folder id", async () => {
  // Given a signed-in owner
  await owner.signIn();
  // mock-reason: the requests sent are the assertion. Every call is real.
  const fetch = vi.spyOn(window, 'fetch');

  // When they open a malformed folder id
  renderAt('/folders/ab12');

  // Then it shows not found, without requesting the folder
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Folder not found',
  );
  expect(fetch.mock.calls.filter(([input]) => isFolderRequest(input))).toEqual(
    [],
  );
});

it("shows loading, not the previous user's folder, when the user changes", async () => {
  // Given the owner's folder on screen, and folder requests left unanswered
  await owner.signIn();
  renderAt(`/folders/${folderIds.london}`);
  await folderHeading('London');
  stallFolderRequests();

  // When a different user signs in
  await act(() => stranger.signIn());

  // Then it shows loading in place of the owner's folder
  expect(loadingFolder()).toBeInTheDocument();
  expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
});

it('shows loading, not the previous folder, when the folder changes', async () => {
  // Given one folder on screen, and folder requests left unanswered
  await owner.signIn();
  const memoryRouter = renderAt(`/folders/${folderIds.london}`);
  await folderHeading('London');
  stallFolderRequests();

  // When the user moves to another folder
  await act(() => memoryRouter.navigate(`/folders/${folderIds.caroKann}`));

  // Then it shows loading in place of the first folder
  expect(loadingFolder()).toBeInTheDocument();
  expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
});
