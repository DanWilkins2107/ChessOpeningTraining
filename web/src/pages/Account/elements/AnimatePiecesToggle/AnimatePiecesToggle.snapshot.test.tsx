import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createQueryClient } from '../../../../elements/createQueryClient/createQueryClient';
import { AnimatePiecesToggle } from './AnimatePiecesToggle';

describe('AnimatePiecesToggle', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <QueryClientProvider client={createQueryClient()}>
        <AnimatePiecesToggle setting={{ status: 'loading' }} />
      </QueryClientProvider>,
    );
    expect(container).toMatchSnapshot();
  });
});
