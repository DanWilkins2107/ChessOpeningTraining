import type { AuthError } from '@supabase/supabase-js';

export function signInErrorMessage({ code }: AuthError): string {
  switch (code) {
    case 'invalid_credentials':
      return 'Incorrect email or password';
    case 'email_not_confirmed':
      return 'Confirm your email first';
    default:
      return "Couldn't sign in, try again";
  }
}
