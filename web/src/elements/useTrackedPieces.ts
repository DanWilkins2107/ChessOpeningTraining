// fallow-ignore-file unused-file -- ef93ff81 2026-10-15 landed ahead of the study page, its first consumer.
import { useState } from 'react';
import { trackPieces } from './trackPieces';
import type { PlacedPiece } from './trackPieces';

// Ids come from the previous placement, so the Board has to remember where the
// pieces were rather than only the position it was last handed.
export function useTrackedPieces(position: string): PlacedPiece[] {
  const [shown, setShown] = useState(() => ({
    position,
    pieces: trackPieces([], position),
  }));
  const current =
    shown.position === position
      ? shown
      : { position, pieces: trackPieces(shown.pieces, position) };
  if (current !== shown) setShown(current);

  return current.pieces;
}
