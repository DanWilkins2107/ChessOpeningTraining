import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoadedBoard } from './LoadedBoard';

describe('LoadedBoard', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <LoadedBoard
        position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        orientation="white"
        animatePieces
        showMoveHints
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
