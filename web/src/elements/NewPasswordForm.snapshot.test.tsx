import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NewPasswordForm } from './NewPasswordForm';

describe('NewPasswordForm', () => {
  it('matches snapshot', () => {
    const { container } = render(<NewPasswordForm onSaved={() => {}} />);
    expect(container).toMatchSnapshot();
  });
});
