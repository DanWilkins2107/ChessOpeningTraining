import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createQueryClient } from '../../elements/createQueryClient/createQueryClient';
import { Repertoire } from './page';

describe('Repertoire', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <QueryClientProvider client={createQueryClient()}>
        <Repertoire />
      </QueryClientProvider>,
    );
    expect(container).toMatchSnapshot();
  });
});
