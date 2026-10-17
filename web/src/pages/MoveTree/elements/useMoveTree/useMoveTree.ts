import { useMemo } from 'react';
import { useUser } from '../../../../shared/useUser/useUser';
import { supabase } from '../../../../supabase';
import type { MoveTreeResponse } from '../MoveTreeResponse/MoveTreeResponse';

export function useMoveTree(moveTreeId: string) {
  const userId = useUser()?.id;

  return useMemo(
    () => (userId === undefined ? undefined : fetchMoveTree(moveTreeId)),
    [userId, moveTreeId],
  );
}

async function fetchMoveTree(moveTreeId: string): Promise<MoveTreeResponse> {
  return supabase
    .from('move_trees')
    .select('name, side')
    .eq('id', moveTreeId)
    .maybeSingle();
}
