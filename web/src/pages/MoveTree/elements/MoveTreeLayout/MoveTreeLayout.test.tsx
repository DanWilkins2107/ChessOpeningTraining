import { render } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Board } from '../../../../elements/Board/Board';
import { MoveTreeLayout } from './MoveTreeLayout';

// mock-reason: the layout's position never arrives yet, so the real board stays
// on its loading state and never shows the props it was given; the call is the
// only place the layout's board settings can be observed.
vi.mock('../../../../elements/Board/Board', () => ({
  Board: vi.fn(() => null),
}));

it('shows a still board: no piece animation, no move hints', () => {
  // When the layout renders
  render(<MoveTreeLayout>Panel</MoveTreeLayout>);

  // Then its board neither animates pieces nor hints at moves
  expect(Board).toHaveBeenCalledWith(
    expect.objectContaining({ animatePieces: false, showMoveHints: false }),
    undefined,
  );
});
