import './MoveTreeLayout.css';

export function MoveTreeLayout({ busy }: { busy: boolean }) {
  return (
    <section
      aria-label="Move tree"
      aria-busy={busy}
      className="move-tree-layout"
    >
      <div className="move-tree-layout-board" />
      <div className="move-tree-layout-panel" />
    </section>
  );
}
