import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BoardSquares } from './BoardSquares';
import { FILES } from '../files/files.constants';
import { trackPieces } from '../trackPieces/trackPieces';

describe('BoardSquares', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <BoardSquares
        files={FILES}
        ranks={[8, 7, 6, 5, 4, 3, 2, 1]}
        pieces={trackPieces([], 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR')}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
