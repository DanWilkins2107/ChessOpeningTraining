import { Board } from '../../../../elements/Board/Board';
import { MoveTreeLayout } from '../MoveTreeLayout/MoveTreeLayout';
import { MoveTreeNotFound } from '../MoveTreeNotFound/MoveTreeNotFound';
import { useMoveTree } from '../useMoveTree/useMoveTree';
import { START_POSITION } from './MoveTreeDetails.constants';
import './MoveTreeDetails.css';

export function MoveTreeDetails({ moveTreeId }: { moveTreeId: string }) {
  const moveTree = useMoveTree(moveTreeId);
  if (moveTree === null) return <MoveTreeNotFound />;

  return (
    <MoveTreeLayout
      board={
        <Board
          position={START_POSITION}
          orientation={moveTree.side}
          animatePieces={false}
          showMoveHints={false}
        />
      }
    >
      <h1 className="move-tree-heading">{moveTree.name}</h1>
    </MoveTreeLayout>
  );
}
