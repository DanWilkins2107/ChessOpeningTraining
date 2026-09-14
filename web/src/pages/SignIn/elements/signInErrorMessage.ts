import type { AuthError } from '@supabase/supabase-js';

export function signInErrorMessage({ code }: AuthError): string {
  switch (code) {
    // The auth server answers an unknown email and a wrong password with this
    // same code, so the message cannot reveal whether the account exists.
    case 'invalid_credentials':
      return 'Incorrect email or password';
    // Only returned once the password has matched.
    case 'email_not_confirmed':
      return 'Confirm your email first';
    default:
      return "Couldn't sign in, try again";
  }
}
