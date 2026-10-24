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
      folders: [],
      move_trees: [],
    });
    const { container } = render(
      <QueryClientProvider client={client}>
        <RepertoireList />
      </QueryClientProvider>,
    );
    expect(container).toMatchSnapshot();
  });
});
