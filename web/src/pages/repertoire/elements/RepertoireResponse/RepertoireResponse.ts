import type { PostgrestResponse } from '@supabase/supabase-js';
import type { Folder } from '../Folder/Folder';
import type { TopLevelMoveTree } from '../TopLevelMoveTree/TopLevelMoveTree';

export type RepertoireResponse = {
  folders: PostgrestResponse<Folder>;
  moveTrees: PostgrestResponse<TopLevelMoveTree>;
};
