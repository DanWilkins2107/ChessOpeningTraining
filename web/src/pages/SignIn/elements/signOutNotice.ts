import {
  SIGN_OUT_NOTICES,
  SIGNED_OUT_PARAM,
} from '../../../elements/signOut.constants';

export const signOutNotice = (params: URLSearchParams) =>
  SIGN_OUT_NOTICES.get(params.get(SIGNED_OUT_PARAM));

export function withoutSignOutNotice(params: URLSearchParams) {
  params.delete(SIGNED_OUT_PARAM);
  return params;
}
