import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { SetNewPassword } from './page';

describe('SetNewPassword', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <MemoryRouter>
        <SetNewPassword />
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });
});
