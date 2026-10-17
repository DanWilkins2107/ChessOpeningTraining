// fallow-ignore-file unused-file -- 488521b4 2026-11-16 the hook landed ahead of its form.
import type { PostgrestError } from '@supabase/supabase-js';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../../../supabase';
import { createMoveTreeErrorMessage } from '../createMoveTreeErrorMessage/createMoveTreeErrorMessage';

type NewMoveTree = {
  folderId: string | null;
  name: string;
  side: 'white' | 'black';
};

async function insertMoveTree({ folderId, name, side }: NewMoveTree) {
  const { error } = await supabase
    .from('move_trees')
    .insert({ folder_id: folderId, name: name.trim(), side });
  if (error) throw error;
}

export function useCreateMoveTree() {
  const { mutate, isPending, error } = useMutation<
    void,
    PostgrestError,
    NewMoveTree
  >({ mutationFn: insertMoveTree });

  return {
    createMoveTree: mutate,
    pending: isPending,
    error: error ? createMoveTreeErrorMessage(error) : undefined,
  };
}
