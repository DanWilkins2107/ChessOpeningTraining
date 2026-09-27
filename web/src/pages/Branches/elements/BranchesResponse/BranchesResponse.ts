import type { PostgrestResponse } from '@supabase/supabase-js';
import type { Branch } from '../Branch/Branch';

export type BranchesResponse = PostgrestResponse<Branch>;
