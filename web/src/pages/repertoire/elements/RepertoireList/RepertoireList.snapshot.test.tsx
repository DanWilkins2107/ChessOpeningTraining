import type { User } from '@supabase/supabase-js';
import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { authUserQuery } from '../../../../elements/authUserQuery/authUserQuery';
import { createQueryClient } from '../../../../elements/createQueryClient/createQueryClient';
import { REPERTOIRE_QUERY_KEY } from '../useRepertoire/useRepertoire.constants';
import { RepertoireList } from './RepertoireList';

describe('RepertoireList', () => {
  it('matches snapshot', () => {
    const client = createQueryClient();
    // as-reason: the list reads only the user's id, and a full supabase User
    // has a dozen required fields that would mean nothing here.
    client.setQueryData(authUserQuery.queryKey, { id: 'user' } as User);
    client.setQueryData([REPERTOIRE_QUERY_KEY, 'user'], {
      folders: [
        { id: 'a4f1', name: 'London', parent_id: null },
        { id: 'b2c3', name: 'Nested', parent_id: 'a4f1' },
      ],
      move_trees: [
        { id: 'c3d4', name: 'Scotch', side: 'white', folder_id: null },
        { id: 'e5f6', name: 'Sicilian', side: 'black', folder_id: null },
        { id: 'f7a8', name: 'Filed', side: 'white', folder_id: 'a4f1' },
      ],
    });
    const { container } = render(
      <QueryClientProvider client={client}>
        <RepertoireList />
      </QueryClientProvider>,
    );
    expect(container).toMatchSnapshot();
  });
});
