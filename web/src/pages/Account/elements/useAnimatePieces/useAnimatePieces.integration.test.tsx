import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { authSettled } from '../../../../tests-shared/authSettled';
import { holdFirstRequest } from '../../../../tests-shared/heldRequest';
import {
  isProfilesRequest,
  turnOffAnimationFor,
} from '../../tests-shared/profiles';
import { registerTestUser } from '../../../../tests-shared/testUser';
import { useAnimatePieces } from './useAnimatePieces';

const animating = registerTestUser();
const still = registerTestUser();

beforeAll(() => turnOffAnimationFor(still));

afterEach(() => {
  vi.restoreAllMocks();
});

function Setting() {
  const setting = useAnimatePieces();
  if (setting.status !== 'loaded') return setting.status;
  return setting.animatePieces ? 'animate' : 'still';
}

const renderSettingTestingHarness = () => render(<Setting />);

// mock-reason: spying only, to see which requests go out. Every request is
// sent for real.
const spyOnFetch = () => vi.spyOn(window, 'fetch');

it('animates for a user who never changed the setting', async () => {
  // Given a user with no saved setting
  await animating.signIn();

  // When the setting loads
  renderSettingTestingHarness();

  // Then it says to animate
  expect(await screen.findByText('animate')).toBeInTheDocument();
});

it('keeps pieces still for a user who turned animation off', async () => {
  // Given a user who turned animation off
  await still.signIn();

  // When the setting loads
  renderSettingTestingHarness();

  // Then it says to keep pieces still
  expect(await screen.findByText('still')).toBeInTheDocument();
});

it('stays loading without asking for a setting while signed out', async () => {
  // Given no signed-in user
  const fetchSpy = spyOnFetch();

  // When the setting renders
  renderSettingTestingHarness();
  await authSettled();

  // Then it is loading and has asked for nothing
  expect(screen.getByText('loading')).toBeInTheDocument();
  expect(fetchSpy.mock.calls.some(([input]) => isProfilesRequest(input))).toBe(
    false,
  );
});

it('shows loading, not the previous setting, while the next user loads', async () => {
  // Given a user who turned animation off, with their setting shown
  await still.signIn();
  renderSettingTestingHarness();
  await screen.findByText('still');

  // When a user with no saved setting signs in, whose request is held
  const request = holdFirstRequest(isProfilesRequest);
  await act(() => animating.signIn());
  await request.sent();

  // Then it is loading until their own setting arrives
  expect(screen.getByText('loading')).toBeInTheDocument();
  await request.answer();
  expect(await screen.findByText('animate')).toBeInTheDocument();
});

it('ignores a setting for a user who has since changed', async () => {
  // Given a user who turned animation off, whose setting request is held
  await still.signIn();
  const request = holdFirstRequest(isProfilesRequest);
  renderSettingTestingHarness();
  await authSettled();
  await request.sent();

  // When a user with no saved setting signs in and their setting shows, then
  // the first response arrives
  await act(() => animating.signIn());
  await screen.findByText('animate');
  await request.answer();

  // Then it still says to animate
  expect(screen.getByText('animate')).toBeInTheDocument();
});
