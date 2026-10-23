import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedUser } from '../../../../shared/useAuthenticatedUser/useAuthenticatedUser';
import { supabase } from '../../../../supabase';
import type { UseProfileSettings } from '../useProfileSettings/useProfileSettings';
import {
  PROFILE_SETTINGS_QUERY_KEY,
  type ProfileSetting,
} from '../useProfileSettings/useProfileSettings.constants';

export function useUpdateProfileSetting(setting: ProfileSetting) {
  const userId = useAuthenticatedUser().id;
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: async (value: boolean) => {
      const row: Partial<UseProfileSettings> = { [setting]: value };
      const { error } = await supabase.from('profiles').upsert(row);
      if (error) throw error;
    },
    onSuccess: (_, value) =>
      queryClient.setQueryData<UseProfileSettings>(
        [PROFILE_SETTINGS_QUERY_KEY, userId],
        (settings) => settings && { ...settings, [setting]: value },
      ),
  });

  return mutateAsync;
}
