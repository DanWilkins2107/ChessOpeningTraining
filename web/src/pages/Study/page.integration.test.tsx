import { createClient } from '@supabase/supabase-js';
import { act, screen, within } from '@testing-library/react';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { renderAt } from '../../tests-shared/renderAt';
import { registerTestUser } from '../../tests-shared/testUser';
import { env } from '../../env';

const owner = registerTestUser();
const stranger = registerTestUser();
const studyIds = { london: '', caroKann: '' };

beforeAll(async () => {
  const client = createClient(
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  await owner.signIn(client);
  const { data, error } = await client
    .from('studies')
    .insert([
      { name: 'London', side: 'white' },
      { name: 'Caro-Kann', side: 'black' },
    ])
    .select('id, name');
  if (error) throw error;
  studyIds.london = data.find(({ name }) => name === 'London')!.id;
  studyIds.caroKann = data.find(({ name }) => name === 'Caro-Kann')!.id;
  for (const name of ['Main line', 'Alternatives']) {
    const inserted = await client
      .from('chapters')
      .insert({ study_id: studyIds.london, name });
    if (inserted.error) throw inserted.error;
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

const isStudyRequest = (input: RequestInfo | URL) =>
  String(input).includes('/rest/v1/studies');

const studyHeading = (name: string) =>
  screen.findByRole('heading', { level: 1, name });

const chapterList = () => screen.queryByRole('list', { name: 'Chapters' });

const loadingStudy = () =>
  screen.queryByRole('status', { name: 'Loading study' });

function stallStudyRequests() {
  const realFetch = window.fetch;
  // mock-reason: the local server answers too fast to see the loading state
  // in between. Other requests are sent for real.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) =>
    isStudyRequest(input) ? new Promise(() => {}) : realFetch(input, init),
  );
}

it('shows a loading indicator while the user loads', async () => {
  // Given a signed-in owner, whose session the page reads only after it renders
  await owner.signIn();

  // When their study page renders
  renderAt(`/studies/${studyIds.london}`);

  // Then it shows a loading indicator
  expect(loadingStudy()).toBeInTheDocument();
});

it("shows the study's name as the page heading", async () => {
  // Given a signed-in owner
  await owner.signIn();

  // When their study page renders
  renderAt(`/studies/${studyIds.london}`);

  // Then the study name is the heading, and loading stops
  expect(await studyHeading('London')).toBeInTheDocument();
  expect(loadingStudy()).not.toBeInTheDocument();
});

it("lists the study's chapters, oldest first", async () => {
  // Given a signed-in owner of a study with chapters
  await owner.signIn();

  // When their study page renders
  renderAt(`/studies/${studyIds.london}`);

  // Then it lists the chapter names in the order they were created
  await studyHeading('London');
  expect(
    within(chapterList()!)
      .getAllByRole('listitem')
      .map(({ textContent }) => textContent),
  ).toEqual(['Main line', 'Alternatives']);
});

it('says so when the study has no chapters', async () => {
  // Given a signed-in owner of a study without chapters
  await owner.signIn();

  // When their study page renders
  renderAt(`/studies/${studyIds.caroKann}`);

  // Then it says there are no chapters yet
  await studyHeading('Caro-Kann');
  expect(screen.getByText('No chapters yet')).toBeInTheDocument();
  expect(chapterList()).not.toBeInTheDocument();
});

it('requests the study once, only once the user has loaded', async () => {
  // Given a signed-in owner not yet loaded
  await owner.signIn();
  // mock-reason: the requests sent are the assertion, and the page shows the
  // same result whether or not an early one went out. Every call is real.
  const fetch = vi.spyOn(window, 'fetch');

  // When their study page renders and loads
  renderAt(`/studies/${studyIds.london}`);
  await studyHeading('London');

  // Then it requested the study once, with chapter names oldest first but
  // never their move trees
  const requests = fetch.mock.calls.filter(([input]) => isStudyRequest(input));
  expect(requests).toHaveLength(1);
  const { searchParams } = new URL(String(requests[0][0]));
  expect(searchParams.get('select')).toBe('name,chapters(id,name)');
  expect(searchParams.get('chapters.order')).toBe('created_at.asc,id.asc');
});

it("shows a load error for a study that isn't the user's", async () => {
  // Given a signed-in user who does not own the study
  await stranger.signIn();

  // When they open it
  renderAt(`/studies/${studyIds.london}`);

  // Then it shows the load error, and no chapters
  expect(await screen.findByRole('alert')).toHaveTextContent(
    "Couldn't load this study, try again",
  );
  expect(chapterList()).not.toBeInTheDocument();
});

it('shows a load error when the request fails', async () => {
  // Given a signed-in owner, and study requests failing on the server
  await owner.signIn();
  const realFetch = window.fetch;
  // mock-reason: the local server has no way to make this request fail. Other
  // requests are sent for real.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) =>
    isStudyRequest(input)
      ? Promise.resolve(new Response('{}', { status: 500 }))
      : realFetch(input, init),
  );

  // When their study page renders
  renderAt(`/studies/${studyIds.london}`);

  // Then it shows the load error
  expect(await screen.findByRole('alert')).toHaveTextContent(
    "Couldn't load this study, try again",
  );
});

it("shows the load error, without asking, for an id that isn't a study id", async () => {
  // Given a signed-in owner
  await owner.signIn();
  // mock-reason: the requests sent are the assertion. Every call is real.
  const fetch = vi.spyOn(window, 'fetch');

  // When they open a malformed study id
  renderAt('/studies/ab12');

  // Then it shows the load error, without requesting the study
  expect(await screen.findByRole('alert')).toHaveTextContent(
    "Couldn't load this study, try again",
  );
  expect(fetch.mock.calls.filter(([input]) => isStudyRequest(input))).toEqual(
    [],
  );
});

it("shows loading, not the previous user's study, when the user changes", async () => {
  // Given the owner's study on screen, and study requests left unanswered
  await owner.signIn();
  renderAt(`/studies/${studyIds.london}`);
  await studyHeading('London');
  stallStudyRequests();

  // When a different user signs in
  await act(() => stranger.signIn());

  // Then it shows loading in place of the owner's study
  expect(loadingStudy()).toBeInTheDocument();
  expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
});

it('shows loading, not the previous study, when the study changes', async () => {
  // Given one study on screen, and study requests left unanswered
  await owner.signIn();
  const memoryRouter = renderAt(`/studies/${studyIds.london}`);
  await studyHeading('London');
  stallStudyRequests();

  // When the user moves to another study
  await act(() => memoryRouter.navigate(`/studies/${studyIds.caroKann}`));

  // Then it shows loading in place of the first study
  expect(loadingStudy()).toBeInTheDocument();
  expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
});
