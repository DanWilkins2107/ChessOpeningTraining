import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ROOKS_HOME } from '../../tests-shared/rookPositions';
import { BoardPieces } from './BoardPieces';
import { FILES } from '../files/files.constants';
import { trackPieces } from '../trackPieces/trackPieces';

describe('BoardPieces', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <BoardPieces
        files={FILES}
        ranks={[8, 7, 6, 5, 4, 3, 2, 1]}
        pieces={trackPieces([], ROOKS_HOME)}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
