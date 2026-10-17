import { LoadBoundary } from '../../../../shared/LoadBoundary/LoadBoundary';
import { BoardLoading } from '../BoardLoading/BoardLoading';
import { MoveTreeBoardLoadError } from '../MoveTreeBoardLoadError/MoveTreeBoardLoadError';
import { MoveTreeMoves } from '../MoveTreeMoves/MoveTreeMoves';

export function MoveTreeBoard({ moveTreeId }: { moveTreeId: string }) {
  return (
    <LoadBoundary Loading={BoardLoading} LoadError={MoveTreeBoardLoadError}>
      <MoveTreeMoves moveTreeId={moveTreeId} />
    </LoadBoundary>
  );
}
