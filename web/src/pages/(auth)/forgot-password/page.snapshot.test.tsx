import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ForgotPassword } from './page';

describe('ForgotPassword', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });
});
