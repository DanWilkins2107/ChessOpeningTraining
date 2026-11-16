// fallow-ignore-file unused-file -- ef93ff81 2026-12-14 landed ahead of the move tree board + title (e62ad75f), its first consumer.
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
