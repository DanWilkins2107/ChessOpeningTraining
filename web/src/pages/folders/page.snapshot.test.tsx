import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createQueryClient } from '../../elements/createQueryClient/createQueryClient';
import { Folders } from './page';

describe('Folders', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <QueryClientProvider client={createQueryClient()}>
        <Folders />
      </QueryClientProvider>,
    );
    expect(container).toMatchSnapshot();
  });
});
