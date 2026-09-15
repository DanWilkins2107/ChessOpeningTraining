import type { AuthError } from '@supabase/supabase-js';

export type ResetOutcome = 'sent' | 'failed';

// Only a known email can hit the per-user send limit, so it reads as sent to
// avoid revealing that the account exists.
export function resetOutcome(error: AuthError | null): ResetOutcome {
  return error === null || error.code === 'over_email_send_rate_limit'
    ? 'sent'
    : 'failed';
}
