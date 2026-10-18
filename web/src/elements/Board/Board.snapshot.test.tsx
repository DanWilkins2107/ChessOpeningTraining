import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Board } from './Board';

describe('Board', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <Board
        position={new Promise<string>(() => {})}
        orientation="white"
        animatePieces
        showMoveHints
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
