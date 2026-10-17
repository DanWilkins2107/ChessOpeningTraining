import type { MoveTree } from '../MoveTree/MoveTree';
import './MoveTreeList.css';

export function MoveTreeList({ moveTrees }: { moveTrees: MoveTree[] }) {
  if (moveTrees.length === 0) {
    return <p className="move-tree-list-empty">No move trees yet</p>;
  }

  return (
    <ul aria-label="Move trees" className="move-tree-list">
      {moveTrees.map(({ id, name }) => (
        <li key={id} className="move-tree-list-item">
          {name}
        </li>
      ))}
    </ul>
  );
}
