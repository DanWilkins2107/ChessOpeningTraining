import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BranchLoading } from './BranchLoading';

describe('BranchLoading', () => {
  it('matches snapshot', () => {
    const { container } = render(<BranchLoading />);
    expect(container).toMatchSnapshot();
  });
});
