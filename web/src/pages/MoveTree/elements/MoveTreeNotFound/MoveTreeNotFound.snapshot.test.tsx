import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MoveTreeNotFound } from './MoveTreeNotFound';

describe('MoveTreeNotFound', () => {
  it('matches snapshot', () => {
    const { container } = render(<MoveTreeNotFound />);
    expect(container).toMatchSnapshot();
  });
});
