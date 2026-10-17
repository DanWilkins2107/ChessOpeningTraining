// fallow-ignore-file unused-file -- ef93ff81 2026-11-16 landed ahead of the folder page, its first consumer.
import type { MoveNode } from '../MoveNode/MoveNode';

export function mapMovesToLineArray(tree: MoveNode[]): string[][] {
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
