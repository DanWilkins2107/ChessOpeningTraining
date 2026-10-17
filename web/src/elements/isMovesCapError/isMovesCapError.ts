// fallow-ignore-file unused-file -- 357a3b13 2026-11-16 landed ahead of the cap error message, its first consumer.
import type { PostgrestError } from '@supabase/supabase-js';

const CHECK_VIOLATION = '23514';

// The database refuses moves over the ply, line or size cap with a
// check_violation, and its message says which cap.
export const isMovesCapError = ({ code }: PostgrestError) =>
  code === CHECK_VIOLATION;
