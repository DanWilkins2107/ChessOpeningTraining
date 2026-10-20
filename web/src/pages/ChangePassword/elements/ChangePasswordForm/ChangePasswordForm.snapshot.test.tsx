import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ChangePasswordForm } from './ChangePasswordForm';

describe('ChangePasswordForm', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <MemoryRouter>
        <ChangePasswordForm onCodeSent={() => {}} />
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });
});
