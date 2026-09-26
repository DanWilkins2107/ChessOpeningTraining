// fallow-ignore-file unused-file -- 5f46d3ff 2026-10-15 landed ahead of the study page, its first consumer.
import { Chess } from 'chess.ts';
import type { PartialMove } from 'chess.ts';
import type { MoveNode, MoveTree } from '../moveTree/moveTree';

type PlayedMove = {
  tree: MoveTree;
  line: string[];
};

export function playMove(
  tree: MoveTree,
  line: string[],
  move: string | PartialMove,
): PlayedMove | null {
  const chess = new Chess();
  for (const san of line) {
    if (chess.move(san) === null) {
      throw new Error(`${san} is illegal in line ${line.join(' ')}`);
    }
  }

  const played = chess.move(move);
  if (played === null) return null;

  return {
    tree: addMove(tree, line, played.san),
    line: [...line, played.san],
  };
}

function addMove(nodes: MoveNode[], line: string[], san: string): MoveNode[] {
  const [next, ...rest] = line;
  if (next === undefined) {
    return nodes.some((node) => node.san === san)
      ? nodes
      : [...nodes, { san, children: [] }];
  }

  const index = nodes.findIndex((node) => node.san === next);
  if (index === -1) {
    throw new Error(`${next} is not in the tree`);
  }

  return nodes.map((node, i) =>
    i === index
      ? { ...node, children: addMove(node.children, rest, san) }
      : node,
  );
}
