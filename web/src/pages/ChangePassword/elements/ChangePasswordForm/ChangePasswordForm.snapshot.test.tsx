import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChangePasswordForm } from './ChangePasswordForm';

describe('ChangePasswordForm', () => {
  it('matches snapshot', () => {
    const { container } = render(<ChangePasswordForm />);
    expect(container).toMatchSnapshot();
  });
});
