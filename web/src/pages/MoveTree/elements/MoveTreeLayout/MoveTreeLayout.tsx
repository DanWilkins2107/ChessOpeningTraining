import type { ReactNode } from 'react';
import { Board } from '../../../../elements/Board/Board';
import './MoveTreeLayout.css';

// TODO dbda0c80 2026-11-15: derive the position, orientation and animation from the move tree.
const POSITION = new Promise<string>(() => {});

export function MoveTreeLayout({ children }: { children: ReactNode }) {
  return (
    <section aria-label="Move tree" className="move-tree-layout">
      <div className="move-tree-layout-board">
        <Board
          position={POSITION}
          orientation="white"
          animatePieces={false}
          showMoveHints={false}
        />
      </div>
      <div className="move-tree-layout-panel">{children}</div>
    </section>
  );
}
