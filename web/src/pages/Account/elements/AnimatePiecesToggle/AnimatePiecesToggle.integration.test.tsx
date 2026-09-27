import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { holdFirstRequest } from '../../../../tests-shared/heldRequest';
import {
  isProfilesRequest,
  turnOffAnimationFor,
} from '../../tests-shared/profiles';
import { renderSettledAt } from '../../../../tests-shared/renderAt';
import { registerTestUser } from '../../../../tests-shared/testUser';
import { supabase } from '../../../../supabase';

const firstVisit = registerTestUser();
const savedOff = registerTestUser();
const turningOff = registerTestUser();
const confirming = registerTestUser();
const clickingOnAndOff = registerTestUser();
const undoing = registerTestUser();
const turningBackOn = registerTestUser();
const clickingDuringSave = registerTestUser();
const failing = registerTestUser();
const comingBack = registerTestUser();

beforeAll(() => turnOffAnimationFor(savedOff));

afterEach(() => {
  vi.restoreAllMocks();
});

const toggle = () =>
  screen.getByRole<HTMLInputElement>('switch', { name: 'Animate pieces' });

const loadedToggle = () =>
  screen.findByRole<HTMLInputElement>('switch', { name: 'Animate pieces' });

const pause = (ms: number) =>
  act(() => new Promise((resolve) => setTimeout(resolve, ms)));

async function renderFor(user: ReturnType<typeof registerTestUser>) {
  await user.signIn();
  return renderSettledAt('/account');
}

function failProfilesRequests(method: 'GET' | 'POST') {
  const realFetch = window.fetch;
  // mock-reason: RLS lets a user read and write their own profile, so the
  // local server cannot be made to fail on demand. Only those requests fail.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) =>
    isProfilesRequest(input) && (init?.method ?? 'GET') === method
      ? Promise.resolve(
          Response.json(
            { code: '42501', message: 'permission denied for table profiles' },
            { status: 403 },
          ),
        )
      : realFetch(input, init),
  );
}

// Lists the value each save sends. With holdFirst, the first save waits for
// release() before it goes out.
function recordSaves({ holdFirst = false } = {}) {
  const realFetch = window.fetch;
  const saves: boolean[] = [];
  let release = () => {};
  const released = new Promise<void>((resolve) => (release = resolve));
  // mock-reason: the local server keeps no count of requests, and answers too
  // fast for a save to still be in flight at the next click. Every request is
  // sent for real.
  vi.spyOn(window, 'fetch').mockImplementation(async (input, init) => {
    if (isProfilesRequest(input) && init?.method === 'POST') {
      saves.push(JSON.parse(String(init.body)).animate_pieces);
      if (holdFirst && saves.length === 1) await released;
    }
    return realFetch(input, init);
  });
  return { saves, release };
}

async function savedAnimatePieces() {
  const { data, error } = await supabase
    .from('profiles')
    .select('animate_pieces')
    .single();
  if (error) throw error;
  return data.animate_pieces;
}

it('shows a placeholder until the setting loads', async () => {
  // Given a signed-in user, whose setting request is held
  const request = holdFirstRequest(isProfilesRequest);

  // When the toggle renders
  await renderFor(firstVisit);
  await request.sent();

  // Then there is no switch yet, only a sign that it is loading
  expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  expect(
    screen.getByRole('status', { name: 'Loading your setting' }),
  ).toBeInTheDocument();
  await request.answer();
  await loadedToggle();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

it('animates pieces for a user who never changed the setting', async () => {
  // Given a user with no saved setting

  // When the toggle loads
  await renderFor(firstVisit);

  // Then it is on
  expect(await loadedToggle()).toBeChecked();
});

it('shows a setting saved earlier', async () => {
  // Given a user who turned animation off before

  // When the toggle loads
  await renderFor(savedOff);

  // Then it is off
  expect(await loadedToggle()).not.toBeChecked();
});

it('turns off at once, and saves after a pause', async () => {
  // Given a user on the toggle
  await renderFor(turningOff);
  const { saves } = recordSaves();

  // When they turn it off
  fireEvent.click(await loadedToggle());

  // Then it shows off straight away, and the profile says so soon after
  expect(toggle()).not.toBeChecked();
  expect(saves).toEqual([]);
  await vi.waitFor(async () => expect(await savedAnimatePieces()).toBe(false));
  expect(saves).toEqual([false]);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('says Saved once saved, until the next click', async () => {
  // Given a user on the toggle
  await renderFor(confirming);

  // When they turn it off
  fireEvent.click(await loadedToggle());

  // Then it says Saved only once the save returns
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(await screen.findByRole('status')).toHaveTextContent('Saved');

  // And the note goes when they click again
  fireEvent.click(toggle());
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(await screen.findByRole('status')).toHaveTextContent('Saved');
});

it('saves only once the clicks stop', async () => {
  // Given a user on the toggle
  await renderFor(clickingOnAndOff);
  const { saves } = recordSaves();

  // When they turn it off, and after a moment on and off again
  fireEvent.click(await loadedToggle());
  await pause(300);
  fireEvent.click(toggle());
  fireEvent.click(toggle());

  // Then nothing is saved until they stop, and then only off
  await pause(350);
  expect(saves).toEqual([]);
  await vi.waitFor(() => expect(saves).toEqual([false]));
});

it('saves nothing when a click is undone', async () => {
  // Given a user on the toggle
  await renderFor(undoing);
  const { saves } = recordSaves();

  // When they turn it off and straight back on
  fireEvent.click(await loadedToggle());
  fireEvent.click(toggle());

  // Then it is on, and nothing was sent
  await pause(700);
  expect(toggle()).toBeChecked();
  expect(saves).toEqual([]);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

it('saves over a setting already saved', async () => {
  // Given a user who turned animation off
  await renderFor(turningBackOn);
  fireEvent.click(await loadedToggle());
  await vi.waitFor(async () => expect(await savedAnimatePieces()).toBe(false));

  // When they turn it on again
  fireEvent.click(toggle());

  // Then the profile says to animate
  await vi.waitFor(async () => expect(await savedAnimatePieces()).toBe(true));
});

it('sends a later choice only after the save in flight', async () => {
  // Given a user whose save of off is in flight
  await renderFor(clickingDuringSave);
  const { saves, release } = recordSaves({ holdFirst: true });
  fireEvent.click(await loadedToggle());
  await vi.waitFor(() => expect(saves).toEqual([false]));

  // When they click on and off, then on, while it waits
  fireEvent.click(toggle());
  fireEvent.click(toggle());
  await pause(700);
  expect(saves).toEqual([false]);
  fireEvent.click(toggle());
  await pause(700);
  expect(saves).toEqual([false]);
  release();

  // Then their last choice is sent once the first save returns
  await vi.waitFor(async () => expect(await savedAnimatePieces()).toBe(true));
  expect(saves).toEqual([false, true]);
});

it('shows a saved choice straight away on coming back', async () => {
  // Given a user who turned animation off and saw it saved
  const memoryRouter = await renderFor(comingBack);
  fireEvent.click(await loadedToggle());
  await screen.findByRole('status');

  // When they leave and come back, with the setting request held
  await act(() => memoryRouter.navigate('/'));
  const request = holdFirstRequest(isProfilesRequest);
  await act(() => memoryRouter.navigate('/account'));

  // Then it shows off before the setting reloads
  await request.sent();
  expect(toggle()).not.toBeChecked();
  await request.answer();
});

it('says so when the setting fails to load', async () => {
  // Given a server that fails the profile request
  failProfilesRequests('GET');

  // When the toggle renders
  await renderFor(failing);

  // Then it shows a generic message, and no switch
  expect(await screen.findByRole('alert')).toHaveTextContent(
    "Couldn't load your settings, try again",
  );
  expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

it('turns back on and says so when saving fails', async () => {
  // Given a user on the toggle, and a server that fails the save
  await renderFor(failing);
  const box = await loadedToggle();
  failProfilesRequests('POST');

  // When they turn it off
  fireEvent.click(box);

  // Then it is on again, with a generic message
  expect(await screen.findByRole('alert')).toHaveTextContent(
    "Couldn't save your setting, try again",
  );
  expect(toggle()).toBeChecked();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();

  // And the message goes when they try again
  vi.restoreAllMocks();
  fireEvent.click(toggle());
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  await vi.waitFor(async () => expect(await savedAnimatePieces()).toBe(false));
});
