import type { PostgrestError } from '@supabase/supabase-js';

const CHECK_VIOLATION = '23514';

// The form sends a trimmed name of 1 to 100 characters and a valid side, so
// the only check an insert can fail is the 500-move-tree cap.
export function createMoveTreeErrorMessage({ code }: PostgrestError): string {
  return code === CHECK_VIOLATION
    ? 'You can have at most 500 move trees'
    : "Couldn't create your move tree, try again";
}
