// chapters.move_tree in supabase/migrations/0003_chapters.sql checks this shape; if either changes, change the other.
export type MoveNode = {
  san: string;
  children: MoveNode[];
};

export type MoveTree = MoveNode[];

export function mapMoveTreeToLineArray(tree: MoveTree): string[][] {
  const found: string[][] = [];
  const path: string[] = [];

  const walk = (nodes: MoveNode[]) => {
    for (const node of nodes) {
      path.push(node.san);
      if (node.children.length === 0) found.push([...path]);
      walk(node.children);
      path.pop();
    }
  };

  walk(tree);
  return found;
}
