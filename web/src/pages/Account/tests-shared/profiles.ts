import type { registerTestUser } from '../../../tests-shared/testUser';

export const isProfilesRequest = (input: RequestInfo | URL) =>
  String(input).includes('/rest/v1/profiles');

export async function turnOffAnimationFor(
  user: ReturnType<typeof registerTestUser>,
) {
  const client = await user.signedInClient();
  const { error } = await client
    .from('profiles')
    .upsert({ animate_pieces: false });
  if (error) throw error;
}
