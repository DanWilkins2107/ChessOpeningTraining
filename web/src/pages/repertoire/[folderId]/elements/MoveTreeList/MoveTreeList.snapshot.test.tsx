import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MoveTreeList } from './MoveTreeList';

describe('MoveTreeList', () => {
  it.each([
    [
      'move trees',
      [{ id: '7c3e1d2a-5b4f-4e6a-9c8d-1f2e3a4b5c6d', name: 'Main line' }],
    ],
    ['no move trees', []],
  ])('matches snapshot with %s', (_, moveTrees) => {
    const { container } = render(<MoveTreeList moveTrees={moveTrees} />);
    expect(container).toMatchSnapshot();
  });
});
