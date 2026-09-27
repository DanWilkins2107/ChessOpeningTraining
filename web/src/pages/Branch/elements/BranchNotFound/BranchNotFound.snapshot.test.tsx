import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BranchNotFound } from './BranchNotFound';

describe('BranchNotFound', () => {
  it('matches snapshot', () => {
    const { container } = render(<BranchNotFound />);
    expect(container).toMatchSnapshot();
  });
});
