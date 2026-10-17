import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MoveTreeLayout } from './MoveTreeLayout';

describe('MoveTreeLayout', () => {
  it('matches snapshot', () => {
    const { container } = render(<MoveTreeLayout />);
    expect(container).toMatchSnapshot();
  });
});
