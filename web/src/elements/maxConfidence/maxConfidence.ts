// fallow-ignore-file unused-file -- 3c64798f 2026-11-22 landed ahead of Exercises (c42b3cac), its first consumer.
import type { ChosenMoveTree } from '../ChosenMoveTree/ChosenMoveTree';

const USER_MAX_CONFIDENCE = 5;
const OPPONENT_MAX_CONFIDENCE = 2;

// Plies count from 1, so white plays the odd ones.
export const maxConfidence = (ply: number, side: ChosenMoveTree['side']) =>
  (ply % 2 === 1) === (side === 'white')
    ? USER_MAX_CONFIDENCE
    : OPPONENT_MAX_CONFIDENCE;
