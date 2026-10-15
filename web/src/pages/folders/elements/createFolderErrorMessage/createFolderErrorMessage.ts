import type { PostgrestError } from '@supabase/supabase-js';

const CHECK_VIOLATION = '23514';

// The form sends a trimmed name of 1 to 100 characters and a side the picker
// chose, so the only check an insert can fail is the 100-folder cap.
export function createFolderErrorMessage({ code }: PostgrestError): string {
  return code === CHECK_VIOLATION
    ? 'You can have at most 100 folders'
    : "Couldn't create your folder, try again";
}
