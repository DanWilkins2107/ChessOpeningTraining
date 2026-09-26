import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ChangeEmailForm } from './ChangeEmailForm';

describe('ChangeEmailForm', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <MemoryRouter>
        <ChangeEmailForm />
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });
});
