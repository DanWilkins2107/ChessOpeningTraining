import type { UseProfileSettings } from '../elements/useProfileSettings/useProfileSettings';
import type { ProfileSetting } from '../elements/useProfileSettings/useProfileSettings.constants';
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
