import { createClient } from '@supabase/supabase-js';
import { act, screen } from '@testing-library/react';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { authSettled } from '../../tests-shared/authSettled';
import { holdFirstRequest } from '../../tests-shared/holdFirstRequest';
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
});

afterEach(() => {
  vi.restoreAllMocks();
});

const isStudyRequest = (input: RequestInfo | URL) =>
  String(input).includes('/rest/v1/studies');

const studyHeading = (name: string) =>
  screen.findByRole('heading', { level: 1, name });

const loadingStudy = () =>
  screen.queryByRole('status', { name: 'Loading study' });

it('shows a loading indicator while the user loads', async () => {
  // Given a signed-in owner not yet loaded
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

it('requests the name once, only once the user has loaded', async () => {
  // Given a signed-in owner not yet loaded
  await owner.signIn();
  // mock-reason: the requests sent are the assertion, and the page shows the
  // same result whether or not an early one went out. Every call is real.
  const fetch = vi.spyOn(window, 'fetch');

  // When their study page renders and loads
  renderAt(`/studies/${studyIds.london}`);
  await studyHeading('London');

  // Then it requested the study once, for its name alone
  const requests = fetch.mock.calls.filter(([input]) => isStudyRequest(input));
  expect(requests).toHaveLength(1);
  expect(new URL(String(requests[0][0])).searchParams.get('select')).toBe(
    'name',
  );
});

it("shows a load error for a study that isn't the user's", async () => {
  // Given a signed-in user who does not own the study
  await stranger.signIn();

  // When they open it
  renderAt(`/studies/${studyIds.london}`);

  // Then it shows the load error
  expect(await screen.findByRole('alert')).toHaveTextContent(
    "Couldn't load this study, try again",
  );
});

it("shows a generic load error for an id that isn't a study id", async () => {
  // Given a signed-in owner
  await owner.signIn();

  // When they open a malformed study id
  renderAt('/studies/ab12');

  // Then it shows the load error, not the server's
  expect(await screen.findByRole('alert')).toHaveTextContent(
    "Couldn't load this study, try again",
  );
  expect(screen.queryByText(/uuid/)).not.toBeInTheDocument();
});

it("shows loading, not the previous user's study, when the user changes", async () => {
  // Given the owner's study on screen, and the next study request held
  await owner.signIn();
  renderAt(`/studies/${studyIds.london}`);
  await studyHeading('London');
  const { release } = holdFirstRequest(isStudyRequest);

  // When a different user signs in
  await act(() => stranger.signIn());

  // Then it shows loading in place of the owner's study
  expect(loadingStudy()).toBeInTheDocument();
  expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  release();
});

it('shows loading, not the previous study, when the study changes', async () => {
  // Given one study on screen, and the next study request held
  await owner.signIn();
  const memoryRouter = renderAt(`/studies/${studyIds.london}`);
  await studyHeading('London');
  const { release } = holdFirstRequest(isStudyRequest);

  // When the user moves to another study
  await act(() => memoryRouter.navigate(`/studies/${studyIds.caroKann}`));

  // Then it shows loading in place of the first study
  expect(loadingStudy()).toBeInTheDocument();
  expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  release();
});

it('ignores a response for a user who has since changed', async () => {
  // Given the owner's study request held
  await owner.signIn();
  const request = holdFirstRequest(isStudyRequest);
  renderAt(`/studies/${studyIds.london}`);
  await authSettled();
  await vi.waitFor(() => expect(request.isHeld()).toBe(true));

  // When a different user signs in and loads, then the owner's response arrives
  await act(() => stranger.signIn());
  await screen.findByRole('alert');
  await request.releaseAndSettle();

  // Then the second user's result stays
  expect(screen.getByRole('alert')).toBeInTheDocument();
  expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
});

it('ignores a response for a study the user has since left', async () => {
  // Given a request for one study held
  await owner.signIn();
  const request = holdFirstRequest(isStudyRequest);
  const memoryRouter = renderAt(`/studies/${studyIds.london}`);
  await authSettled();
  await vi.waitFor(() => expect(request.isHeld()).toBe(true));

  // When the user moves to another study and it loads, then the first arrives
  await act(() => memoryRouter.navigate(`/studies/${studyIds.caroKann}`));
  await studyHeading('Caro-Kann');
  await request.releaseAndSettle();

  // Then the second study stays
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
    'Caro-Kann',
  );
});
