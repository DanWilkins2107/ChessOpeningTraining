// fallow-ignore-file unused-file -- ef93ff81 2026-10-15 landed ahead of the study page, its first consumer.
import type { MoveNode } from '../MoveNode/MoveNode';
import type { MoveTree } from '../MoveTree/MoveTree';

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
