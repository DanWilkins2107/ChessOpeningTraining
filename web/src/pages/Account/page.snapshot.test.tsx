import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { createQueryClient } from '../../elements/createQueryClient/createQueryClient';
import { Account } from './page';

describe('Account', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter>
          <Account />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(container).toMatchSnapshot();
  });
});
