import { use } from 'react';
import { MoveTreeLayout } from '../MoveTreeLayout/MoveTreeLayout';
import { MoveTreeLoadError } from '../MoveTreeLoadError/MoveTreeLoadError';
import { MoveTreeNotFound } from '../MoveTreeNotFound/MoveTreeNotFound';
import type { MoveTreeResponse } from '../MoveTreeResponse/MoveTreeResponse';

export function LoadedMoveTree({
  moveTree,
}: {
  moveTree: Promise<MoveTreeResponse>;
}) {
  const { data, error } = use(moveTree);

  if (error !== null) return <MoveTreeLoadError />;
  if (data === null) return <MoveTreeNotFound />;

  return <MoveTreeLayout busy={false} />;
}
