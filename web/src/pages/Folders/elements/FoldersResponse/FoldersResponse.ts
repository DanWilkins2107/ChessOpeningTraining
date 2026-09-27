import type { PostgrestResponse } from '@supabase/supabase-js';
import type { Folder } from '../Folder/Folder';

export type FoldersResponse = PostgrestResponse<Folder>;
