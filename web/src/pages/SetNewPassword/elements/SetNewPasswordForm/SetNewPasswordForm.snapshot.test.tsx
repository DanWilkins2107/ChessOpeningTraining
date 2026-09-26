import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { SetNewPasswordForm } from './SetNewPasswordForm';

describe('SetNewPasswordForm', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <MemoryRouter>
        <SetNewPasswordForm />
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });
});
