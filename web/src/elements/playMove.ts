// fallow-ignore-file unused-file -- 5f46d3ff 2026-10-15 landed ahead of the study page, its first consumer.
import { Chess } from 'chess.ts';
import type { PartialMove } from 'chess.ts';
import type { MoveNode, MoveTree } from './moveTree';

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

  const playedLine = [...line, played.san];
  return { tree: addLine(tree, playedLine), line: playedLine };
}

function addLine(nodes: MoveNode[], line: string[]): MoveNode[] {
  if (line.length === 0) return nodes;

  const [san, ...rest] = line;
  const index = nodes.findIndex((node) => node.san === san);
  if (index === -1) return [...nodes, { san, children: addLine([], rest) }];

  return nodes.map((node, i) =>
    i === index ? { ...node, children: addLine(node.children, rest) } : node,
  );
}
