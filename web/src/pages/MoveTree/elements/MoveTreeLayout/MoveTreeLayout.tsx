import { BoardLoading } from '../BoardLoading/BoardLoading';
import './MoveTreeLayout.css';

export function MoveTreeLayout() {
  return (
    <section aria-label="Move tree" className="move-tree-layout">
      <div className="move-tree-layout-board">
        <BoardLoading />
      </div>
      <div className="move-tree-layout-panel" />
    </section>
  );
}
