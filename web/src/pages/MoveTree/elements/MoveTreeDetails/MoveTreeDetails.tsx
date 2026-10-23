import { MoveTreeNotFound } from '../MoveTreeNotFound/MoveTreeNotFound';
import { useMoveTree } from '../useMoveTree/useMoveTree';

export function MoveTreeDetails({ moveTreeId }: { moveTreeId: string }) {
  return useMoveTree(moveTreeId) === null ? <MoveTreeNotFound /> : null;
}
