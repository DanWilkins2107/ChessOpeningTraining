import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NotFound } from './page';

describe('NotFound', () => {
  it('matches snapshot', () => {
    const { container } = render(<NotFound />);
    expect(container).toMatchSnapshot();
  });
});
