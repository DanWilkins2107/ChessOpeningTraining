import type { User } from '@supabase/supabase-js';
import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { createElement } from 'react';
import { authUserQuery } from '../../../elements/authUserQuery/authUserQuery';
import { createQueryClient } from '../../../elements/createQueryClient/createQueryClient';
import { MoveTreeDetails } from '../elements/MoveTreeDetails/MoveTreeDetails';
import { MOVE_TREE_QUERY_KEY } from '../elements/useMoveTree/useMoveTree.constants';

const MOVE_TREE_ID = '7c3e1d2a-5b4f-4e6a-9c8d-1f2e3a4b5c6d';

// Renders the details with the move tree already loaded, or null for not found.
export function renderMoveTreeDetails(
  moveTree: { name: string; side: 'white' | 'black' } | null,
) {
  const client = createQueryClient();
  // as-reason: the move tree query reads only the user's id, and a full
  // supabase User has a dozen required fields that would mean nothing here.
  client.setQueryData(authUserQuery.queryKey, { id: 'user' } as User);
  client.setQueryData([MOVE_TREE_QUERY_KEY, 'user', MOVE_TREE_ID], moveTree);
  return render(
    createElement(
      QueryClientProvider,
      { client },
      createElement(MoveTreeDetails, { moveTreeId: MOVE_TREE_ID }),
    ),
  );
}
