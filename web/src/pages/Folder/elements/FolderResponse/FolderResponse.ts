import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import type { Chapter } from '../Chapter/Chapter';

export type FolderResponse = PostgrestSingleResponse<{
  name: string;
  chapters: Chapter[];
} | null>;
