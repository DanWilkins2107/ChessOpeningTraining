import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CreateBranchForm } from './CreateBranchForm';

describe('CreateBranchForm', () => {
  it('matches snapshot', () => {
    const { container } = render(<CreateBranchForm onCreated={() => {}} />);
    expect(container).toMatchSnapshot();
  });
});
