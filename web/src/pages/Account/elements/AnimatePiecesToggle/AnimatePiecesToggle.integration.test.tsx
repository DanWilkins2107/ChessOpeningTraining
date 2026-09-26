import { fireEvent, screen } from '@testing-library/react';
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
const turningOff = registerTestUser();
const savedOff = registerTestUser();
const turningBackOn = registerTestUser();
const failing = registerTestUser();

beforeAll(() => turnOffAnimationFor(savedOff));

afterEach(() => {
  vi.restoreAllMocks();
});

const checkbox = () =>
  screen.getByRole<HTMLInputElement>('checkbox', { name: 'Animate pieces' });

const loadedCheckbox = async () => {
  await vi.waitFor(() => expect(checkbox()).toBeEnabled());
  return checkbox();
};

async function renderFor(user: ReturnType<typeof registerTestUser>) {
  await user.signIn();
  await renderSettledAt('/account');
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

async function savedAnimatePieces() {
  const { data, error } = await supabase
    .from('profiles')
    .select('animate_pieces')
    .single();
  if (error) throw error;
  return data.animate_pieces;
}

it('holds the checkbox until the setting loads', async () => {
  // Given a signed-in user, whose setting request is held
  const request = holdFirstRequest(isProfilesRequest);

  // When the toggle renders
  await renderFor(firstVisit);
  await request.sent();

  // Then it cannot be changed yet
  expect(checkbox()).toBeDisabled();
  await request.answer();
  await loadedCheckbox();
});

it('animates pieces for a user who never changed the setting', async () => {
  // Given a user with no saved setting

  // When the toggle loads
  await renderFor(firstVisit);

  // Then it is ticked
  expect(await loadedCheckbox()).toBeChecked();
});

it('saves the setting when it is unticked', async () => {
  // Given a user on the toggle
  await renderFor(turningOff);

  // When they untick it
  fireEvent.click(await loadedCheckbox());

  // Then it shows unticked and the profile says so
  expect(checkbox()).not.toBeChecked();
  await vi.waitFor(async () => expect(await savedAnimatePieces()).toBe(false));
});

it('shows a setting saved earlier', async () => {
  // Given a user who turned animation off before

  // When the toggle loads
  await renderFor(savedOff);

  // Then it is unticked
  expect(await loadedCheckbox()).not.toBeChecked();
});

it('saves over a setting already saved', async () => {
  // Given a user who turned animation off
  await renderFor(turningBackOn);
  fireEvent.click(await loadedCheckbox());
  await vi.waitFor(async () => expect(await savedAnimatePieces()).toBe(false));

  // When they tick it again
  fireEvent.click(checkbox());

  // Then the profile says to animate
  await vi.waitFor(async () => expect(await savedAnimatePieces()).toBe(true));
});

it('says so and keeps the checkbox held when the setting fails to load', async () => {
  // Given a server that fails the profile request
  failProfilesRequests('GET');

  // When the toggle renders
  await renderFor(failing);

  // Then it shows a generic message and cannot be changed
  expect(await screen.findByRole('alert')).toHaveTextContent(
    "Couldn't load your settings, try again",
  );
  expect(checkbox()).toBeDisabled();
});

it('puts the tick back and says so when saving fails', async () => {
  // Given a user on the toggle, and a server that fails the save
  await renderFor(failing);
  const box = await loadedCheckbox();
  failProfilesRequests('POST');

  // When they untick it
  fireEvent.click(box);

  // Then it is ticked again, with a generic message
  expect(await screen.findByRole('alert')).toHaveTextContent(
    "Couldn't save your setting, try again",
  );
  expect(checkbox()).toBeChecked();
});
