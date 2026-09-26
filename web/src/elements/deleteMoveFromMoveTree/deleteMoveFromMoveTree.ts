// fallow-ignore-file unused-file -- ef93ff81 2026-10-15 landed ahead of the study page, its first consumer.
import type { MoveTree } from '../MoveTree/MoveTree';

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
