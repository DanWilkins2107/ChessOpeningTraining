// fallow-ignore-file unused-file -- cbef563b 2026-12-21 split out of the exercise statuses, unused until the training session (aaf71c83).
import type { MoveNode } from '../MoveNode/MoveNode';

export const findMoveNode = (
  tree: MoveNode[],
  path: string[],
): MoveNode | undefined => {
  let nodes = tree;
  let node: MoveNode | undefined;
  for (const san of path) {
    node = nodes.find((candidate) => candidate.san === san);
    if (node === undefined) return undefined;
    nodes = node.children;
  }
  return node;
};
