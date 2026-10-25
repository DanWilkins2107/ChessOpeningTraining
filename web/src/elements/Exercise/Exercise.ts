// fallow-ignore-file unused-file -- c5bbb354 2026-11-24 landed ahead of the exercise enumerations (c42b3cac), its first consumers.
import type { ChosenMoveTree } from '../ChosenMoveTree/ChosenMoveTree';

// side: the combined tree it comes from (otherColour plays the opposite colour).
// path: SANs from the root, both colours. A line runs to the leaf, a split ends
// on your move, an ownSplit ends just before your alternative moves.
export type Exercise = {
  type: 'line' | 'split' | 'ownSplit' | 'otherColour';
  side: ChosenMoveTree['side'];
  path: string[];
};
