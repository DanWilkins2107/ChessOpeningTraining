import type { ReactNode } from 'react';
import { BoardLoading } from '../../../../elements/BoardLoading/BoardLoading';
import './MoveTreeLayout.css';

type MoveTreeLayoutProps = {
  // A placeholder board until there's a move tree to show.
  board?: ReactNode;
  children?: ReactNode;
};

export function MoveTreeLayout({
  board = <BoardLoading />,
  children,
}: MoveTreeLayoutProps) {
  return (
    <section aria-label="Move tree" className="move-tree-layout">
      <div className="move-tree-layout-board">{board}</div>
      <div className="move-tree-layout-panel">{children}</div>
    </section>
  );
}
