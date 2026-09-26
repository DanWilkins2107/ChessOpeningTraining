import {
  SIGN_OUT_NOTICES,
  SIGNED_OUT_PARAM,
} from '../../../../shared/signOut/signOut.constants';

export const signOutNotice = (params: URLSearchParams) =>
  SIGN_OUT_NOTICES.get(params.get(SIGNED_OUT_PARAM));
