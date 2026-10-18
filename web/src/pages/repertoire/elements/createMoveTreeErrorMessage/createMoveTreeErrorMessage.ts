// fallow-ignore-file unused-file -- 488521b4 2026-11-16 the hook landed ahead of its form.
import type { PostgrestError } from '@supabase/supabase-js';
import { CHECK_VIOLATION } from '../../../../shared/postgresErrorCodes/postgresErrorCodes.constants';

// Callers send a name of 1 to 100 characters once trimmed and a valid side, so
// the only check an insert can fail is the 500-move-tree cap.
export function createMoveTreeErrorMessage({ code }: PostgrestError): string {
  return code === CHECK_VIOLATION
    ? 'You can have at most 500 move trees'
    : "Couldn't create your move tree, try again";
}
