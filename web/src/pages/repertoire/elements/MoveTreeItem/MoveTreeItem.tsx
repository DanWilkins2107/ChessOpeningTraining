import type { RepertoireMoveTree } from '../RepertoireMoveTree/RepertoireMoveTree';
import './MoveTreeItem.css';

export function MoveTreeItem({
  moveTree: { name, side },
}: {
  moveTree: RepertoireMoveTree;
}) {
  return (
    <li className="move-tree-item">
      <svg
        className="move-tree-item-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle cx="6" cy="5" r="2.5" />
        <circle cx="6" cy="19" r="2.5" />
        <circle cx="18" cy="8" r="2.5" />
        <path d="M6 7.5v9M18 10.5c0 4-4 5.5-10 6.5" />
      </svg>
      <span className="move-tree-item-name">{name}</span>
      <span className="move-tree-item-side" data-side={side}>
        {side}
      </span>
    </li>
  );
}
