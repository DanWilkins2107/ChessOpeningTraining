import type { AuthError } from '@supabase/supabase-js';
import { TRY_AGAIN_MESSAGE } from './newPasswordErrorMessage.constants';

export function newPasswordErrorMessage({ code, message }: AuthError): string {
  return code === 'weak_password' || code === 'same_password'
    ? message
    : TRY_AGAIN_MESSAGE;
}
