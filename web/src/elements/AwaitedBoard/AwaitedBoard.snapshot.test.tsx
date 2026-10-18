import { act, render } from '@testing-library/react';
import { Suspense } from 'react';
import { describe, expect, it } from 'vitest';
import { AwaitedBoard } from './AwaitedBoard';

describe('AwaitedBoard', () => {
  it('matches snapshot', async () => {
    const { container } = await act(async () =>
      render(
        <Suspense>
          <AwaitedBoard
            position={Promise.resolve(
              'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            )}
            orientation="white"
            animatePieces
            showMoveHints
          />
        </Suspense>,
      ),
    );
    expect(container).toMatchSnapshot();
  });
});
