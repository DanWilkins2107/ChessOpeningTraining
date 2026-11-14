import { Link, generatePath } from 'react-router-dom';
import { MOVE_TREE_ROUTE_PATH } from '../../../MoveTree/router.constants';
import { PawnTile } from '../PawnTile/PawnTile';
import type { RepertoireMoveTree } from '../RepertoireMoveTree/RepertoireMoveTree';
import './MoveTreeItem.css';

export function MoveTreeItem({
  moveTree: { id, name, side },
}: {
  moveTree: RepertoireMoveTree;
}) {
  return (
    <li>
      <Link
        className="move-tree-item"
        to={generatePath(MOVE_TREE_ROUTE_PATH, { moveTreeId: id })}
      >
        <PawnTile side={side} />
        <span className="move-tree-item-name">{name}</span>
      </Link>
    </li>
  );
}
