import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { DeleteAccountForm } from './DeleteAccountForm';

describe('DeleteAccountForm', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <MemoryRouter>
        <DeleteAccountForm />
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });
});
