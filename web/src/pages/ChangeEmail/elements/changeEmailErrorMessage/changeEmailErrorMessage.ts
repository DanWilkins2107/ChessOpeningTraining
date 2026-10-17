import type { AuthError } from '@supabase/supabase-js';

export function changeEmailErrorMessage({ code }: AuthError): string {
  switch (code) {
    case 'email_exists':
      return 'That email is already in use';
    case 'email_address_invalid':
    case 'validation_failed':
      return 'Enter a valid email address';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'Too many attempts, try again later';
    default:
      return "Couldn't change your email, try again";
  }
}
