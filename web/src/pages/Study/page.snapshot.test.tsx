import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Study } from './page';

describe('Study', () => {
  it('matches snapshot', () => {
    const { container } = render(<Study />);
    expect(container).toMatchSnapshot();
  });
});
