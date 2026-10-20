import { QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { createQueryClient } from '../../../../elements/createQueryClient/createQueryClient';
import { LoadBoundary } from '../../../../shared/LoadBoundary/LoadBoundary';
import { authSettled } from '../../../../tests-shared/authSettled';
import { holdFirstRequest } from '../../tests-shared/heldRequest';
import {
  LOADING,
  LoadError,
  Loading,
} from '../../../../tests-shared/loadStates';
import {
  isProfilesRequest,
  turnOffSettingFor,
} from '../../tests-shared/profiles';
import { registerTestUser } from '../../../../tests-shared/testUser';
import { useProfileSettings } from './useProfileSettings';

const animating = registerTestUser();
const still = registerTestUser();
const hintless = registerTestUser();

beforeAll(async () => {
  await turnOffSettingFor(still, 'animate_pieces');
  await turnOffSettingFor(hintless, 'show_move_hints');
});

afterEach(() => {
  vi.restoreAllMocks();
});

function Settings() {
  const { data } = useProfileSettings();
  return (
    <>
      <span>{data.animate_pieces ? 'animate' : 'still'}</span>
      <span>{data.show_move_hints ? 'hints' : 'no hints'}</span>
    </>
  );
}

const renderSettingTestingHarness = () =>
  render(
    <QueryClientProvider client={createQueryClient()}>
      <LoadBoundary Loading={Loading} LoadError={LoadError}>
        <Settings />
      </LoadBoundary>
    </QueryClientProvider>,
  );

it('animates for a user who never changed the setting', async () => {
  // Given a user with no saved setting
  await animating.signIn();

  // When the setting loads
  renderSettingTestingHarness();

  // Then it says to animate and show hints
  expect(await screen.findByText('animate')).toBeInTheDocument();
  expect(screen.getByText('hints')).toBeInTheDocument();
});

it('keeps pieces still for a user who turned animation off', async () => {
  // Given a user who turned animation off
  await still.signIn();

  // When the setting loads
  renderSettingTestingHarness();

  // Then it says to keep pieces still
  expect(await screen.findByText('still')).toBeInTheDocument();
});

it('hides hints for a user who turned move hints off', async () => {
  // Given a user who turned move hints off
  await hintless.signIn();

  // When the setting loads
  renderSettingTestingHarness();

  // Then it says to hide hints, and still to animate
  expect(await screen.findByText('no hints')).toBeInTheDocument();
  expect(screen.getByText('animate')).toBeInTheDocument();
});

it('asks for the settings columns only', async () => {
  // Given a signed-in user
  await animating.signIn();
  // mock-reason: the requests sent are the assertion. Every call is real.
  const fetchSpy = vi.spyOn(window, 'fetch');

  // When the settings load
  renderSettingTestingHarness();
  await screen.findByText('animate');

  // Then the request selects only the settings
  const [input] = fetchSpy.mock.calls.find(([url]) => isProfilesRequest(url))!;
  expect(new URL(String(input)).searchParams.get('select')).toBe(
    'animate_pieces,show_move_hints',
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
  expect(screen.getByText(LOADING)).toBeInTheDocument();
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

  // When a user with no saved setting signs in, then the first response
  // arrives
  await act(() => animating.signIn());
  await request.answer();

  // Then it never shows that setting, only their own
  expect(screen.queryByText('still')).not.toBeInTheDocument();
  expect(await screen.findByText('animate')).toBeInTheDocument();
});
