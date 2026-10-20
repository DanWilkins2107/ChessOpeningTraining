import { PawnTile } from '../PawnTile/PawnTile';
import type { RepertoireMoveTree } from '../RepertoireMoveTree/RepertoireMoveTree';
import './MoveTreeItem.css';

export function MoveTreeItem({
  moveTree: { name, side },
}: {
  moveTree: RepertoireMoveTree;
}) {
  return (
    <li className="move-tree-item">
      <PawnTile side={side} />
      <span className="move-tree-item-name">{name}</span>
    </li>
  );
}
