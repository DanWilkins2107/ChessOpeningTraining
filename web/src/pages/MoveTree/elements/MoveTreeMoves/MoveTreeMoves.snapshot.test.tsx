import type { User } from '@supabase/supabase-js';
import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { authUserQuery } from '../../../../elements/authUserQuery/authUserQuery';
import { createQueryClient } from '../../../../elements/createQueryClient/createQueryClient';
import { MOVES_QUERY_KEY } from '../../../../elements/useMoves/useMoves.constants';
import { MoveTreeMoves } from './MoveTreeMoves';

const MOVE_TREE_ID = '7c3e1d2a-5b4f-4e6a-9c8d-1f2e3a4b5c6d';

describe('MoveTreeMoves', () => {
  it('matches snapshot', () => {
    const client = createQueryClient();
    // as-reason: the moves query reads only the user's id, and a full supabase
    // User has a dozen required fields that would mean nothing here.
    client.setQueryData(authUserQuery.queryKey, { id: 'user' } as User);
    client.setQueryData([MOVES_QUERY_KEY, 'user', MOVE_TREE_ID], []);
    const { container } = render(
      <QueryClientProvider client={client}>
        <MoveTreeMoves moveTreeId={MOVE_TREE_ID} />
      </QueryClientProvider>,
    );
    expect(container).toMatchSnapshot();
  });
});
