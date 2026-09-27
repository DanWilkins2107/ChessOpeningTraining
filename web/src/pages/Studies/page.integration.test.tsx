import { createClient } from '@supabase/supabase-js';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { authSettled } from '../../tests-shared/authSettled';
import { holdFirstRequest } from '../../tests-shared/heldRequest';
import { registerTestUser } from '../../tests-shared/testUser';
import { env } from '../../env';
import { Studies } from './page';

const withStudies = registerTestUser();
const withoutStudies = registerTestUser();
const creatingStudies = registerTestUser();

beforeAll(async () => {
  const client = createClient(
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  await withStudies.signIn(client);
  for (const study of [
    { name: 'Caro-Kann', side: 'black' },
    { name: 'London', side: 'white' },
  ]) {
    const { error } = await client.from('studies').insert(study);
    if (error) throw error;
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

const isStudiesRequest = (input: RequestInfo | URL) =>
  String(input).includes('/rest/v1/studies');

const listedStudies = async () =>
  (await screen.findAllByRole('listitem')).map((item) =>
    [...item.children].map((part) => part.textContent),
  );

it('shows the heading and a loading indicator while the user loads', async () => {
  // Given a signed-in user not yet loaded
  await withStudies.signIn();

  // When the page renders
  render(<Studies />);

  // Then the heading shows straight away, with a loading indicator
  expect(screen.getByRole('heading', { name: 'Studies' })).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveAccessibleName('Loading studies');
});

it("lists the user's studies with their side, newest first", async () => {
  // Given a user with two studies
  await withStudies.signIn();

  // When the page renders
  render(<Studies />);

  // Then it lists them, newest first, and stops loading
  expect(await listedStudies()).toEqual([
    ['London', 'white'],
    ['Caro-Kann', 'black'],
  ]);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

it('says so when the user has no studies', async () => {
  // Given a user with no studies
  await withoutStudies.signIn();

  // When the page renders
  render(<Studies />);

  // Then it shows the empty state
  expect(await screen.findByText('No studies yet')).toBeInTheDocument();
});

it('adds a created study to the list', async () => {
  // Given a signed-in user with no studies, on the page
  await creatingStudies.signIn();
  render(<Studies />);
  await screen.findByText('No studies yet');

  // When they create a study
  fireEvent.change(screen.getByLabelText('Study name'), {
    target: { value: 'Najdorf' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Create study' }));

  // Then it appears in the list
  expect(await screen.findByText('Najdorf')).toBeInTheDocument();
});

it('requests studies only once the user has loaded', async () => {
  // Given a signed-in user not yet loaded
  await withoutStudies.signIn();
  // mock-reason: the requests sent are the assertion, and the page shows the
  // same result whether or not an early one went out. Every call is real.
  const fetch = vi.spyOn(window, 'fetch');

  // When the page renders and loads
  render(<Studies />);
  await screen.findByText('No studies yet');

  // Then it requested studies once
  expect(
    fetch.mock.calls.filter(([input]) => isStudiesRequest(input)),
  ).toHaveLength(1);
});

it('asks for the columns the list renders and no others', async () => {
  // Given a signed-in user
  await withoutStudies.signIn();
  // mock-reason: what the request asks the server for is the assertion, and
  // the rows come back the same either way. Every call is real.
  const fetch = vi.spyOn(window, 'fetch');

  // When the page renders and loads
  render(<Studies />);
  await screen.findByText('No studies yet');

  // Then the studies request selects those three columns alone
  const [input] = fetch.mock.calls.find(([input]) => isStudiesRequest(input))!;
  expect(new URL(String(input)).searchParams.get('select')).toBe(
    'id,name,side',
  );
});

it('shows a generic message when studies fail to load', async () => {
  // Given a signed-in user, and a server that fails the studies request
  await withStudies.signIn();
  const realFetch = window.fetch;
  // mock-reason: RLS lets a user read their own studies, so the local server
  // cannot be made to fail the request on demand. Only it is failed.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) =>
    isStudiesRequest(input)
      ? Promise.resolve(
          Response.json(
            { code: '42501', message: 'permission denied for table studies' },
            { status: 403 },
          ),
        )
      : realFetch(input, init),
  );

  // When the page renders
  render(<Studies />);

  // Then it shows a generic message, not the server's error
  expect(await screen.findByRole('alert')).toHaveTextContent(
    "Couldn't load your studies, try again",
  );
  expect(screen.queryByText(/permission denied/)).not.toBeInTheDocument();
});

it("shows loading, not the previous user's studies, when the user changes", async () => {
  // Given one user's studies on screen, and a server slow to answer the next
  await withStudies.signIn();
  render(<Studies />);
  await listedStudies();
  const realFetch = window.fetch;
  let release = () => {};
  const released = new Promise<void>((resolve) => (release = resolve));
  // mock-reason: the local server answers too fast to see the page between
  // users. Studies requests are held, then sent for real.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) =>
    isStudiesRequest(input)
      ? released.then(() => realFetch(input, init))
      : realFetch(input, init),
  );

  // When a different user signs in
  await act(() => withoutStudies.signIn());

  // Then it shows loading in place of the first user's studies
  expect(screen.getByRole('status')).toBeInTheDocument();
  expect(screen.queryAllByRole('listitem')).toEqual([]);
  release();
});

it('ignores a response for a user who has since changed', async () => {
  // Given a user whose studies request is held
  await withStudies.signIn();
  const request = holdFirstRequest(isStudiesRequest);
  render(<Studies />);
  await authSettled();
  await request.sent();

  // When a different user signs in and loads, then the first response arrives
  await act(() => withoutStudies.signIn());
  await screen.findByText('No studies yet');
  await request.answer();

  // Then the second user's result stays
  expect(screen.getByText('No studies yet')).toBeInTheDocument();
});
