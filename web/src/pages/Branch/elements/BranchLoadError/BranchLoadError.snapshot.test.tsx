import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BranchLoadError } from './BranchLoadError';

describe('BranchLoadError', () => {
  it('matches snapshot', () => {
    const { container } = render(<BranchLoadError />);
    expect(container).toMatchSnapshot();
  });
});
