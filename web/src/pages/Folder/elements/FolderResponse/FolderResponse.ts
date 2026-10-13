import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import type { MoveTree } from '../MoveTree/MoveTree';

export type FolderResponse = PostgrestSingleResponse<{
  name: string;
  move_trees: MoveTree[];
} | null>;
