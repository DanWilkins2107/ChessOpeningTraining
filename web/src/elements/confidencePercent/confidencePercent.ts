// fallow-ignore-file unused-file -- 3c64798f 2026-11-22 landed ahead of Exercises (c42b3cac), its first consumer.
import type { ChosenMoveTree } from '../ChosenMoveTree/ChosenMoveTree';
import { maxConfidence } from '../maxConfidence/maxConfidence';
import type { MoveNode } from '../MoveNode/MoveNode';

type Score = { confidence: number; max: number };

// Weighted by move count across the trees; pass one tree for its own percent.
export function confidencePercent(
  trees: Pick<ChosenMoveTree, 'side' | 'moves'>[],
): number {
  const total = trees
    .flatMap((tree) => scores(tree.moves, tree.side, 1))
    .reduce(addScores, { confidence: 0, max: 0 });
  if (total.max === 0) return 100;
  return Math.floor((100 * total.confidence) / total.max);
}

const scores = (
  moves: MoveNode[],
  side: ChosenMoveTree['side'],
  ply: number,
): Score[] =>
  moves.flatMap((move) => [
    { confidence: move.confidence ?? 0, max: maxConfidence(ply, side) },
    ...scores(move.children, side, ply + 1),
  ]);

const addScores = (total: Score, score: Score): Score => ({
  confidence: total.confidence + score.confidence,
  max: total.max + score.max,
});
