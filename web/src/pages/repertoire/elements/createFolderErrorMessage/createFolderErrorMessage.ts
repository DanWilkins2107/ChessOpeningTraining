import type { PostgrestError } from '@supabase/supabase-js';
import { CHECK_VIOLATION } from '../../../../shared/postgresErrorCodes/postgresErrorCodes.constants';

// The form sends a trimmed name of 1 to 100 characters, so the only check an
// insert can fail is the 100-folder cap.
export function createFolderErrorMessage({ code }: PostgrestError): string {
  return code === CHECK_VIOLATION
    ? 'You can have at most 100 folders'
    : "Couldn't create your folder, try again";
}
