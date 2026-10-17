import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MoveTreeBoardLoadError } from './MoveTreeBoardLoadError';

describe('MoveTreeBoardLoadError', () => {
  it('matches snapshot', () => {
    const { container } = render(<MoveTreeBoardLoadError />);
    expect(container).toMatchSnapshot();
  });
});
