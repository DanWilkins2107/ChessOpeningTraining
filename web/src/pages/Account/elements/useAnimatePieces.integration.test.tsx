import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { authSettled } from '../../../tests-shared/authSettled';
import { holdFirstRequest } from '../../../tests-shared/heldRequest';
import {
  isProfilesRequest,
  turnOffAnimationFor,
} from '../tests-shared/profiles';
import { registerTestUser } from '../../../tests-shared/testUser';
import { useAnimatePieces } from './useAnimatePieces';

const animating = registerTestUser();
const still = registerTestUser();

beforeAll(() => turnOffAnimationFor(still));

afterEach(() => {
  vi.restoreAllMocks();
});

function Setting() {
  const { status, animatePieces } = useAnimatePieces();
  return `${status} ${animatePieces ? 'animate' : 'still'}`;
}

const renderSettingTestingHarness = () => render(<Setting />);

it('animates for a user who never changed the setting', async () => {
  // Given a user with no saved setting
  await animating.signIn();

  // When the setting loads
  renderSettingTestingHarness();

  // Then it says to animate
  expect(await screen.findByText('loaded animate')).toBeInTheDocument();
});

it('keeps pieces still for a user who turned animation off', async () => {
  // Given a user who turned animation off
  await still.signIn();

  // When the setting loads
  renderSettingTestingHarness();

  // Then it says to keep pieces still
  expect(await screen.findByText('loaded still')).toBeInTheDocument();
});

it('ignores a setting for a user who has since changed', async () => {
  // Given a user who turned animation off, whose setting request is held
  await still.signIn();
  const request = holdFirstRequest(isProfilesRequest);
  renderSettingTestingHarness();
  await authSettled();
  await request.sent();

  // When a user with no saved setting signs in, then the first response arrives
  await act(() => animating.signIn());
  await request.answer();

  // Then it still says to animate
  expect(await screen.findByText('loaded animate')).toBeInTheDocument();
});
