import { PIECES } from '../../../../shared/pieces/pieces.constants';
import type { RepertoireMoveTree } from '../RepertoireMoveTree/RepertoireMoveTree';
import './MoveTreeItem.css';

export function MoveTreeItem({
  moveTree: { name, side },
}: {
  moveTree: RepertoireMoveTree;
}) {
  const pawn = PIECES[side === 'white' ? 'P' : 'p'];
  return (
    <li className="move-tree-item">
      <img className="move-tree-item-icon" src={pawn.image} alt={pawn.name} />
      <span className="move-tree-item-name">{name}</span>
    </li>
  );
}
