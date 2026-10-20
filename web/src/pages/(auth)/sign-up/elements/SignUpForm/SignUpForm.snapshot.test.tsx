import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SignUpForm } from './SignUpForm';

describe('SignUpForm', () => {
  it('matches snapshot', () => {
    const { container } = render(<SignUpForm onSignedUp={() => {}} />);
    expect(container).toMatchSnapshot();
  });
});
