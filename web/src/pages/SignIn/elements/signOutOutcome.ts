import {
  SIGN_OUT_NOTICES,
  SIGNED_OUT_PARAM,
} from '../../../elements/signOut.constants';

export const signOutOutcome = (params: URLSearchParams) =>
  params.get(SIGNED_OUT_PARAM);

export const signOutNotice = (outcome: string | null) =>
  SIGN_OUT_NOTICES.get(outcome);

export function withoutSignOutNotice(params: URLSearchParams) {
  params.delete(SIGNED_OUT_PARAM);
  return params;
}
