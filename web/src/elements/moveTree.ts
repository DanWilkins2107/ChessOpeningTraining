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

export function deleteMoveFromMoveTree(
  tree: MoveTree,
  path: string[],
): MoveTree {
  const [san, ...rest] = path;
  if (!tree.some((node) => node.san === san)) {
    throw new Error(`No move ${san} in the tree`);
  }
  if (rest.length === 0) return tree.filter((node) => node.san !== san);

  return tree.map((node) =>
    node.san === san
      ? { ...node, children: deleteMoveFromMoveTree(node.children, rest) }
      : node,
  );
}
