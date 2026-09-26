import type { PostgrestResponse } from '@supabase/supabase-js';
import type { Study } from '../Study/Study';

export type StudiesResponse = PostgrestResponse<Study>;
