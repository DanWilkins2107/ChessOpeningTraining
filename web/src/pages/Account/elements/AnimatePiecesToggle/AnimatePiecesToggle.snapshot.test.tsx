import type { User } from '@supabase/supabase-js';
import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { authUserQuery } from '../../../../elements/authUserQuery/authUserQuery';
import { createQueryClient } from '../../../../elements/createQueryClient/createQueryClient';
import { ANIMATE_PIECES_QUERY_KEY } from '../useAnimatePieces/useAnimatePieces.constants';
import { AnimatePiecesToggle } from './AnimatePiecesToggle';

describe('AnimatePiecesToggle', () => {
  it('matches snapshot', () => {
    const client = createQueryClient();
    // as-reason: the toggle reads only the user's id, and a full supabase User
    // has a dozen required fields that would mean nothing here.
    client.setQueryData(authUserQuery.queryKey, { id: 'user' } as User);
    client.setQueryData([ANIMATE_PIECES_QUERY_KEY, 'user'], true);
    const { container } = render(
      <QueryClientProvider client={client}>
        <AnimatePiecesToggle />
      </QueryClientProvider>,
    );
    expect(container).toMatchSnapshot();
  });
});
