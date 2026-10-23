import { render } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { MoveTreeLayout } from './MoveTreeLayout';

// mock-reason: the vi.mock factory below runs before this module body, so the
// Board spy has to be built inside vi.hoisted to exist in time.
const { Board } = vi.hoisted(() => ({ Board: vi.fn(() => null) }));

// mock-reason: the placeholder position never arrives, so the real Board stays
// on its loading state and never shows what it was told about animation/hints.
vi.mock('../../../../elements/Board/Board', () => ({ Board }));

it('shows a still board without move hints', () => {
  // Given the move tree layout
  // When it renders
  render(<MoveTreeLayout>Panel</MoveTreeLayout>);

  // Then the board neither animates pieces nor hints at moves
  expect(Board).toHaveBeenCalledWith(
    expect.objectContaining({ animatePieces: false, showMoveHints: false }),
    undefined,
  );
});
