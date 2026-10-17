import type { PostgrestResponse } from '@supabase/supabase-js';
import type { Folder } from '../Folder/Folder';
import type { RepertoireMoveTree } from '../RepertoireMoveTree/RepertoireMoveTree';

export type RepertoireResponse = {
  folders: PostgrestResponse<Folder>;
  moveTrees: PostgrestResponse<RepertoireMoveTree>;
};
