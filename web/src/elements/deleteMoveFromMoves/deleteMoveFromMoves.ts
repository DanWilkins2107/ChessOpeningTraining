// fallow-ignore-file unused-file -- ef93ff81 2026-11-16 landed ahead of the folder page, its first consumer.
import type { MoveNode } from '../MoveNode/MoveNode';

export function deleteMoveFromMoves(
  tree: MoveNode[],
  path: string[],
): MoveNode[] {
  const [san, ...rest] = path;
  if (!tree.some((node) => node.san === san)) {
    throw new Error(`No move ${san} in the tree`);
  }
  if (rest.length === 0) return tree.filter((node) => node.san !== san);

  return tree.map((node) =>
    node.san === san
      ? { ...node, children: deleteMoveFromMoves(node.children, rest) }
      : node,
  );
}
