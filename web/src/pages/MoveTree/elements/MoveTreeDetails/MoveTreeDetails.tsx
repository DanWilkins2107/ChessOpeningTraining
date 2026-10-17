import { Suspense } from 'react';
import { LoadedMoveTree } from '../LoadedMoveTree/LoadedMoveTree';
import { MoveTreeLayout } from '../MoveTreeLayout/MoveTreeLayout';
import { useMoveTree } from '../useMoveTree/useMoveTree';

export function MoveTreeDetails({ moveTreeId }: { moveTreeId: string }) {
  const moveTree = useMoveTree(moveTreeId);

  if (moveTree === undefined) return <MoveTreeLayout busy />;

  return (
    <Suspense key={moveTreeId} fallback={<MoveTreeLayout busy />}>
      <LoadedMoveTree moveTree={moveTree} />
    </Suspense>
  );
}
