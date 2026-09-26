import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Account } from './page';

describe('Account', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <MemoryRouter>
        <Account />
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });
});
