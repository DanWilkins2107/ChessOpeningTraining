import type { PostgrestSingleResponse } from '@supabase/supabase-js';

export type StudyResponse = PostgrestSingleResponse<{ name: string } | null>;
