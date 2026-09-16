import type { AuthError } from '@supabase/supabase-js';

export type ResetOutcome = 'sent' | 'failed';

// Hitting the per-user send limit means a reset link went out moments ago, so
// the user already has one: same confirmation as a fresh send, not an error.
export function resetOutcome(error: AuthError | null): ResetOutcome {
  return error === null || error.code === 'over_email_send_rate_limit'
    ? 'sent'
    : 'failed';
}
