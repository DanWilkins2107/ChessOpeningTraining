import { createClient } from '@supabase/supabase-js';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { authSettled } from '../../tests-shared/authSettled';
import { holdFirstRequest } from '../../tests-shared/heldRequest';
import { registerTestUser } from '../../tests-shared/testUser';
import { env } from '../../env';
import { Branches } from './page';

const withBranches = registerTestUser();
const withoutBranches = registerTestUser();
const creatingBranches = registerTestUser();

beforeAll(async () => {
  const client = createClient(
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  await withBranches.signIn(client);
  for (const branch of [
    { name: 'Caro-Kann', side: 'black' },
    { name: 'London', side: 'white' },
  ]) {
    const { error } = await client.from('branches').insert(branch);
    if (error) throw error;
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

const isBranchesRequest = (input: RequestInfo | URL) =>
  String(input).includes('/rest/v1/branches');

const listedBranches = async () =>
  (await screen.findAllByRole('link')).map((link) =>
    [...link.children].map((part) => part.textContent),
  );

it('shows the heading and a loading indicator while the user loads', async () => {
  // Given a signed-in user not yet loaded
  await withBranches.signIn();

  // When the page renders
  render(<Branches />, { wrapper: MemoryRouter });

  // Then the heading shows straight away, with a loading indicator
  expect(screen.getByRole('heading', { name: 'Branches' })).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveAccessibleName('Loading branches');
});

it("lists the user's branches with their side, newest first", async () => {
  // Given a user with two branches
  await withBranches.signIn();

  // When the page renders
  render(<Branches />, { wrapper: MemoryRouter });

  // Then it lists them, newest first, and stops loading
  expect(await listedBranches()).toEqual([
    ['London', 'white'],
    ['Caro-Kann', 'black'],
  ]);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

it('says so when the user has no branches', async () => {
  // Given a user with no branches
  await withoutBranches.signIn();

  // When the page renders
  render(<Branches />, { wrapper: MemoryRouter });

  // Then it shows the empty state
  expect(await screen.findByText('No branches yet')).toBeInTheDocument();
});

it('adds a created branch to the list', async () => {
  // Given a signed-in user with no branches, on the page
  await creatingBranches.signIn();
  render(<Branches />, { wrapper: MemoryRouter });
  await screen.findByText('No branches yet');

  // When they create a branch
  fireEvent.change(screen.getByLabelText('Branch name'), {
    target: { value: 'Najdorf' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Create branch' }));

  // Then it appears in the list
  expect(await screen.findByText('Najdorf')).toBeInTheDocument();
});

it('requests branches only once the user has loaded', async () => {
  // Given a signed-in user not yet loaded
  await withoutBranches.signIn();
  // mock-reason: the requests sent are the assertion, and the page shows the
  // same result whether or not an early one went out. Every call is real.
  const fetch = vi.spyOn(window, 'fetch');

  // When the page renders and loads
  render(<Branches />, { wrapper: MemoryRouter });
  await screen.findByText('No branches yet');

  // Then it requested branches once
  expect(
    fetch.mock.calls.filter(([input]) => isBranchesRequest(input)),
  ).toHaveLength(1);
});

it('asks for the columns the list renders and no others', async () => {
  // Given a signed-in user
  await withoutBranches.signIn();
  // mock-reason: what the request asks the server for is the assertion, and
  // the rows come back the same either way. Every call is real.
  const fetch = vi.spyOn(window, 'fetch');

  // When the page renders and loads
  render(<Branches />, { wrapper: MemoryRouter });
  await screen.findByText('No branches yet');

  // Then the branches request selects those three columns alone
  const [input] = fetch.mock.calls.find(([input]) => isBranchesRequest(input))!;
  expect(new URL(String(input)).searchParams.get('select')).toBe(
    'id,name,side',
  );
});

it('shows a generic message when branches fail to load', async () => {
  // Given a signed-in user, and a server that fails the branches request
  await withBranches.signIn();
  const realFetch = window.fetch;
  // mock-reason: RLS lets a user read their own branches, so the local server
  // cannot be made to fail the request on demand. Only it is failed.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) =>
    isBranchesRequest(input)
      ? Promise.resolve(
          Response.json(
            { code: '42501', message: 'permission denied for table branches' },
            { status: 403 },
          ),
        )
      : realFetch(input, init),
  );

  // When the page renders
  render(<Branches />, { wrapper: MemoryRouter });

  // Then it shows a generic message, not the server's error
  expect(await screen.findByRole('alert')).toHaveTextContent(
    "Couldn't load your branches, try again",
  );
  expect(screen.queryByText(/permission denied/)).not.toBeInTheDocument();
});

it("shows loading, not the previous user's branches, when the user changes", async () => {
  // Given one user's branches on screen, and a server slow to answer the next
  await withBranches.signIn();
  render(<Branches />, { wrapper: MemoryRouter });
  await listedBranches();
  const realFetch = window.fetch;
  let release = () => {};
  const released = new Promise<void>((resolve) => (release = resolve));
  // mock-reason: the local server answers too fast to see the page between
  // users. Branches requests are held, then sent for real.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) =>
    isBranchesRequest(input)
      ? released.then(() => realFetch(input, init))
      : realFetch(input, init),
  );

  // When a different user signs in
  await act(() => withoutBranches.signIn());

  // Then it shows loading in place of the first user's branches
  expect(screen.getByRole('status')).toBeInTheDocument();
  expect(screen.queryAllByRole('listitem')).toEqual([]);
  release();
});

it('ignores a response for a user who has since changed', async () => {
  // Given a user whose branches request is held
  await withBranches.signIn();
  const request = holdFirstRequest(isBranchesRequest);
  render(<Branches />, { wrapper: MemoryRouter });
  await authSettled();
  await request.sent();

  // When a different user signs in and loads, then the first response arrives
  await act(() => withoutBranches.signIn());
  await screen.findByText('No branches yet');
  await request.answer();

  // Then the second user's result stays
  expect(screen.getByText('No branches yet')).toBeInTheDocument();
});
