import { createClient } from '@supabase/supabase-js';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { authSettled } from '../../tests-shared/authSettled';
import { holdFirstRequest } from '../../tests-shared/heldRequest';
import { registerTestUser } from '../../tests-shared/testUser';
import { env } from '../../env';
import { Folders } from './page';

const withFolders = registerTestUser();
const withoutFolders = registerTestUser();
const creatingFolders = registerTestUser();

beforeAll(async () => {
  const client = createClient(
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  await withFolders.signIn(client);
  for (const folder of [
    { name: 'Caro-Kann', side: 'black' },
    { name: 'London', side: 'white' },
  ]) {
    const { error } = await client.from('folders').insert(folder);
    if (error) throw error;
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

const isFoldersRequest = (input: RequestInfo | URL) =>
  String(input).includes('/rest/v1/folders');

const listedFolders = async () =>
  (await screen.findAllByRole('link')).map((link) =>
    [...link.children].map((part) => part.textContent),
  );

it('shows the heading and a loading indicator while the user loads', async () => {
  // Given a signed-in user not yet loaded
  await withFolders.signIn();

  // When the page renders
  render(<Folders />, { wrapper: MemoryRouter });

  // Then the heading shows straight away, with a loading indicator
  expect(screen.getByRole('heading', { name: 'Folders' })).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveAccessibleName('Loading folders');
});

it("lists the user's folders with their side, newest first", async () => {
  // Given a user with two folders
  await withFolders.signIn();

  // When the page renders
  render(<Folders />, { wrapper: MemoryRouter });

  // Then it lists them, newest first, and stops loading
  expect(await listedFolders()).toEqual([
    ['London', 'white'],
    ['Caro-Kann', 'black'],
  ]);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

it('says so when the user has no folders', async () => {
  // Given a user with no folders
  await withoutFolders.signIn();

  // When the page renders
  render(<Folders />, { wrapper: MemoryRouter });

  // Then it shows the empty state
  expect(await screen.findByText('No folders yet')).toBeInTheDocument();
});

it('adds a created folder to the list', async () => {
  // Given a signed-in user with no folders, on the page
  await creatingFolders.signIn();
  render(<Folders />, { wrapper: MemoryRouter });
  await screen.findByText('No folders yet');

  // When they create a folder
  fireEvent.change(screen.getByLabelText('Folder name'), {
    target: { value: 'Najdorf' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Create folder' }));

  // Then it appears in the list
  expect(await screen.findByText('Najdorf')).toBeInTheDocument();
});

it('requests folders only once the user has loaded', async () => {
  // Given a signed-in user not yet loaded
  await withoutFolders.signIn();
  // mock-reason: the requests sent are the assertion, and the page shows the
  // same result whether or not an early one went out. Every call is real.
  const fetch = vi.spyOn(window, 'fetch');

  // When the page renders and loads
  render(<Folders />, { wrapper: MemoryRouter });
  await screen.findByText('No folders yet');

  // Then it requested folders once
  expect(
    fetch.mock.calls.filter(([input]) => isFoldersRequest(input)),
  ).toHaveLength(1);
});

it('asks for the columns the list renders and no others', async () => {
  // Given a signed-in user
  await withoutFolders.signIn();
  // mock-reason: what the request asks the server for is the assertion, and
  // the rows come back the same either way. Every call is real.
  const fetch = vi.spyOn(window, 'fetch');

  // When the page renders and loads
  render(<Folders />, { wrapper: MemoryRouter });
  await screen.findByText('No folders yet');

  // Then the folders request selects those three columns alone
  const [input] = fetch.mock.calls.find(([input]) => isFoldersRequest(input))!;
  expect(new URL(String(input)).searchParams.get('select')).toBe(
    'id,name,side',
  );
});

it('shows a generic message when folders fail to load', async () => {
  // Given a signed-in user, and a server that fails the folders request
  await withFolders.signIn();
  const realFetch = window.fetch;
  // mock-reason: RLS lets a user read their own folders, so the local server
  // cannot be made to fail the request on demand. Only it is failed.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) =>
    isFoldersRequest(input)
      ? Promise.resolve(
          Response.json(
            { code: '42501', message: 'permission denied for table folders' },
            { status: 403 },
          ),
        )
      : realFetch(input, init),
  );

  // When the page renders
  render(<Folders />, { wrapper: MemoryRouter });

  // Then it shows a generic message, not the server's error
  expect(await screen.findByRole('alert')).toHaveTextContent(
    "Couldn't load your folders, try again",
  );
  expect(screen.queryByText(/permission denied/)).not.toBeInTheDocument();
});

it("shows loading, not the previous user's folders, when the user changes", async () => {
  // Given one user's folders on screen, and a server slow to answer the next
  await withFolders.signIn();
  render(<Folders />, { wrapper: MemoryRouter });
  await listedFolders();
  const realFetch = window.fetch;
  let release = () => {};
  const released = new Promise<void>((resolve) => (release = resolve));
  // mock-reason: the local server answers too fast to see the page between
  // users. Folders requests are held, then sent for real.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) =>
    isFoldersRequest(input)
      ? released.then(() => realFetch(input, init))
      : realFetch(input, init),
  );

  // When a different user signs in
  await act(() => withoutFolders.signIn());

  // Then it shows loading in place of the first user's folders
  expect(screen.getByRole('status')).toBeInTheDocument();
  expect(screen.queryAllByRole('listitem')).toEqual([]);
  release();
});

it('ignores a response for a user who has since changed', async () => {
  // Given a user whose folders request is held
  await withFolders.signIn();
  const request = holdFirstRequest(isFoldersRequest);
  render(<Folders />, { wrapper: MemoryRouter });
  await authSettled();
  await request.sent();

  // When a different user signs in and loads, then the first response arrives
  await act(() => withoutFolders.signIn());
  await screen.findByText('No folders yet');
  await request.answer();

  // Then the second user's result stays
  expect(screen.getByText('No folders yet')).toBeInTheDocument();
});
