import type { AuthError } from '@supabase/supabase-js';

export type ResetOutcome = 'sent' | 'failed';

// Only a known email can hit the per-user send limit. Reading it as sent keeps
// this page from showing that the account exists; it does not stop enumeration
// through the auth API itself: https://github.com/supabase/auth/issues/2398
export function resetOutcome(error: AuthError | null): ResetOutcome {
  return error === null || error.code === 'over_email_send_rate_limit'
    ? 'sent'
    : 'failed';
}
