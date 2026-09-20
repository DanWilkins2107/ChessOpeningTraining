import type { AuthError } from '@supabase/supabase-js';

export function setNewPasswordErrorMessage({
  code,
  message,
}: AuthError): string {
  return code === 'weak_password' || code === 'same_password'
    ? message
    : "Couldn't set your password, try again";
}
