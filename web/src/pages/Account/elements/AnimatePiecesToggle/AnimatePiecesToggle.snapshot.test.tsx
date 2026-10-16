import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createQueryClient } from '../../../../elements/createQueryClient/createQueryClient';
import { ANIMATE_PIECES_QUERY_KEY } from '../useAnimatePieces/useAnimatePieces.constants';
import { AnimatePiecesToggle } from './AnimatePiecesToggle';

describe('AnimatePiecesToggle', () => {
  it('matches snapshot', () => {
    const client = createQueryClient();
    client.setQueryData([ANIMATE_PIECES_QUERY_KEY, 'user'], true);
    const { container } = render(
      <QueryClientProvider client={client}>
        <AnimatePiecesToggle userId="user" />
      </QueryClientProvider>,
    );
    expect(container).toMatchSnapshot();
  });
});
