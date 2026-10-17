import { MoveTreeLayout } from '../MoveTreeLayout/MoveTreeLayout';
import { MoveTreeLoadError } from '../MoveTreeLoadError/MoveTreeLoadError';
import { MoveTreeNotFound } from '../MoveTreeNotFound/MoveTreeNotFound';
import { useMoveTree } from '../useMoveTree/useMoveTree';

export function MoveTreeDetails({ moveTreeId }: { moveTreeId: string }) {
  const { data, isError } = useMoveTree(moveTreeId);

  if (isError) return <MoveTreeLoadError />;
  if (data === null) return <MoveTreeNotFound />;

  return <MoveTreeLayout moveTreeId={moveTreeId} />;
}
