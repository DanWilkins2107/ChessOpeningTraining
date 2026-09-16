import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Board } from './Board';

describe('Board', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <Board
        position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        orientation="white"
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
