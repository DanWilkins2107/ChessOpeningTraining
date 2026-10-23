import type { User } from '@supabase/supabase-js';
import { QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { authUserQuery } from '../../../elements/authUserQuery/authUserQuery';
import { createQueryClient } from '../../../elements/createQueryClient/createQueryClient';
import type { UseProfileSettings } from '../elements/useProfileSettings/useProfileSettings';
import {
  PROFILE_SETTINGS_QUERY_KEY,
  type ProfileSetting,
} from '../elements/useProfileSettings/useProfileSettings.constants';
import type { registerTestUser } from '../../../tests-shared/testUser';

export const isProfilesRequest = (input: RequestInfo | URL) =>
  String(input).includes('/rest/v1/profiles');

export async function turnOffSettingFor(
  user: ReturnType<typeof registerTestUser>,
  setting: ProfileSetting,
) {
  const client = await user.signedInClient();
  const row: Partial<UseProfileSettings> = { [setting]: false };
  const { error } = await client.from('profiles').upsert(row);
  if (error) throw error;
}

export function withLoadedSettings(
  ui: ReactNode,
  settings: UseProfileSettings,
) {
  const client = createQueryClient();
  // as-reason: the settings read only the user's id, and a full supabase User
  // has a dozen required fields that would mean nothing here.
  client.setQueryData(authUserQuery.queryKey, { id: 'user' } as User);
  client.setQueryData([PROFILE_SETTINGS_QUERY_KEY, 'user'], settings);
  return createElement(QueryClientProvider, { client }, ui);
}
