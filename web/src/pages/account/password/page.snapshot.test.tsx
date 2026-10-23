import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ChangePassword } from './page';

describe('ChangePassword', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <MemoryRouter>
        <ChangePassword />
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });
});
