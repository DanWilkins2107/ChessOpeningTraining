import { SIGNED_OUT_PARAM } from '../../../../shared/signOut/signOut.constants';

export function withoutSignOutNotice(params: URLSearchParams) {
  params.delete(SIGNED_OUT_PARAM);
  return params;
}
