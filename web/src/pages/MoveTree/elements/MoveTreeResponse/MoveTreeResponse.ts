import type { PostgrestSingleResponse } from '@supabase/supabase-js';

export type MoveTreeResponse = PostgrestSingleResponse<{
  name: string;
  side: 'white' | 'black';
} | null>;
