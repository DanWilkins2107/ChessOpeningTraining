import type { AuthError } from '@supabase/supabase-js';

export const TRY_AGAIN = "Couldn't set your password, try again";

export function newPasswordErrorMessage({ code, message }: AuthError): string {
  if (code === 'reauthentication_not_valid')
    return 'That code is wrong or has expired';
  return code === 'weak_password' || code === 'same_password'
    ? message
    : TRY_AGAIN;
}
