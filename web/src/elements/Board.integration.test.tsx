import { act, render } from '@testing-library/react';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { authSettled } from '../tests-shared/authSettled';
import { holdFirstRequest } from '../tests-shared/heldRequest';
import {
  isProfilesRequest,
  turnOffAnimationFor,
} from '../tests-shared/profiles';
import { registerTestUser } from '../tests-shared/testUser';
import { Board } from './Board';

const animating = registerTestUser();
const still = registerTestUser();

const LONE_KING = '8/8/8/8/8/8/8/4K3';

beforeAll(() => turnOffAnimationFor(still));

afterEach(() => {
  vi.restoreAllMocks();
});

const renderBoard = () =>
  render(<Board position={LONE_KING} orientation="white" />);

const king = () => document.querySelector('.board-piece');

it('slides pieces for a user who never changed the setting', async () => {
  // Given a user with no saved setting
  await animating.signIn();

  // When the board loads
  renderBoard();
  await authSettled();

  // Then its pieces keep their slide
  await vi.waitFor(() => expect(king()).toHaveClass('board-piece'));
  expect(king()).not.toHaveClass('board-piece-still');
});

it('keeps pieces still for a user who turned animation off', async () => {
  // Given a user who turned animation off
  await still.signIn();

  // When the board loads
  renderBoard();

  // Then its pieces move without sliding
  await vi.waitFor(() => expect(king()).toHaveClass('board-piece-still'));
});

it('ignores a setting for a user who has since changed', async () => {
  // Given a user who turned animation off, whose setting request is held
  await still.signIn();
  const request = holdFirstRequest(isProfilesRequest);
  renderBoard();
  await authSettled();
  await request.sent();

  // When a user with no saved setting signs in, then the first response arrives
  await act(() => animating.signIn());
  await request.answer();

  // Then the pieces still slide
  expect(king()).not.toHaveClass('board-piece-still');
});
