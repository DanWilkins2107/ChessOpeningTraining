import type { User } from '@supabase/supabase-js';
import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { authUserQuery } from '../../../../elements/authUserQuery/authUserQuery';
import { createQueryClient } from '../../../../elements/createQueryClient/createQueryClient';
import { PROFILE_SETTINGS_QUERY_KEY } from '../useProfileSettings/useProfileSettings.constants';
import { SettingToggle } from './SettingToggle';

describe('SettingToggle', () => {
  it('matches snapshot', () => {
    const client = createQueryClient();
    // as-reason: the toggle reads only the user's id, and a full supabase User
    // has a dozen required fields that would mean nothing here.
    client.setQueryData(authUserQuery.queryKey, { id: 'user' } as User);
    client.setQueryData([PROFILE_SETTINGS_QUERY_KEY, 'user'], {
      animate_pieces: true,
      show_move_hints: false,
    });
    const { container } = render(
      <QueryClientProvider client={client}>
        <SettingToggle setting="show_move_hints" />
      </QueryClientProvider>,
    );
    expect(container).toMatchSnapshot();
  });
});
