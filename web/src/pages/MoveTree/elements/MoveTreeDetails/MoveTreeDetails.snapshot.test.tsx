import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createQueryClient } from '../../../../elements/createQueryClient/createQueryClient';
import { MoveTreeDetails } from './MoveTreeDetails';

describe('MoveTreeDetails', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <QueryClientProvider client={createQueryClient()}>
        <MoveTreeDetails moveTreeId="7c3e1d2a-5b4f-4e6a-9c8d-1f2e3a4b5c6d" />
      </QueryClientProvider>,
    );
    expect(container).toMatchSnapshot();
  });
});
