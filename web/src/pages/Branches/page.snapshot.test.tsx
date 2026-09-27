import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Branches } from './page';

describe('Branches', () => {
  it('matches snapshot', () => {
    const { container } = render(<Branches />);
    expect(container).toMatchSnapshot();
  });
});
