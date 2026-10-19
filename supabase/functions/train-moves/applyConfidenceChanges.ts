export type Side = 'white' | 'black';

export type TrainedMove = {
  san: string;
  confidence?: number;
  children: TrainedMove[];
};

const USER_MAX_CONFIDENCE = 5;
const OPPONENT_MAX_CONFIDENCE = 2;

// Plies count from 0, so white plays the even ones.
const isUserPly = (ply: number, side: Side) =>
  (ply % 2 === 0) === (side === 'white');

export const userMoveCount = (path: string[], side: Side) =>
  path.filter((_, ply) => isUserPly(ply, side)).length;

function trainedConfidence(
  move: TrainedMove,
  change: number,
  maxConfidence: number,
) {
  return Math.min(maxConfidence, Math.max(0, (move.confidence ?? 0) + change));
}

// Undefined when the path is not in the moves.
export function applyConfidenceChanges(
  moves: TrainedMove[],
  side: Side,
  path: string[],
  confidenceChanges: number[],
  ply = 0,
): TrainedMove[] | undefined {
  if (ply === path.length) return moves;

  const index = moves.findIndex((move) => move.san === path[ply]);
  if (index === -1) return undefined;

  const move = moves[index];
  const children = applyConfidenceChanges(
    move.children,
    side,
    path,
    confidenceChanges,
    ply + 1,
  );
  if (!children) return undefined;

  const maxConfidence = isUserPly(ply, side)
    ? USER_MAX_CONFIDENCE
    : OPPONENT_MAX_CONFIDENCE;
  return moves.with(index, {
    ...move,
    confidence: trainedConfidence(move, confidenceChanges[ply], maxConfidence),
    children,
  });
}
