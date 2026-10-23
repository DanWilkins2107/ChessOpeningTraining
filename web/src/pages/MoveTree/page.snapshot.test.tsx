import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MoveTree } from './page';

describe('MoveTree', () => {
  it('matches snapshot', () => {
    const { container } = render(<MoveTree />);
    expect(container).toMatchSnapshot();
  });
});
