import type { AuthError } from '@supabase/supabase-js';
import {
  TRY_AGAIN_MESSAGE,
  WRONG_CODE_MESSAGE,
} from './newPasswordErrorMessage.constants';

export function newPasswordErrorMessage({ code, message }: AuthError): string {
  if (code === 'reauthentication_not_valid') return WRONG_CODE_MESSAGE;
  return code === 'weak_password' || code === 'same_password'
    ? message
    : TRY_AGAIN_MESSAGE;
}
