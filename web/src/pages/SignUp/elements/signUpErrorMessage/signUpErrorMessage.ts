import type { AuthError } from '@supabase/supabase-js';

export function signUpErrorMessage({ code, message }: AuthError): string {
  return code === 'weak_password' ? message : "Couldn't sign up, try again";
}
