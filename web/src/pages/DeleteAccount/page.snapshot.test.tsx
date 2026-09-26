import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { DeleteAccount } from './page';

describe('DeleteAccount', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <MemoryRouter>
        <DeleteAccount />
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });
});
