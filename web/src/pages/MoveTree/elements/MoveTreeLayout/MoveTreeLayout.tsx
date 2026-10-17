import { MoveTreeBoard } from '../MoveTreeBoard/MoveTreeBoard';
import './MoveTreeLayout.css';

export function MoveTreeLayout({ moveTreeId }: { moveTreeId: string }) {
  return (
    <section aria-label="Move tree" className="move-tree-layout">
      <div className="move-tree-layout-board">
        <MoveTreeBoard moveTreeId={moveTreeId} />
      </div>
      <div className="move-tree-layout-panel" />
    </section>
  );
}
