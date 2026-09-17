// fallow-ignore-file unused-file -- ef93ff81 2026-10-15 landed ahead of the study page, its first consumer.
import { PIECES } from './pieces.constants';
import type { Piece } from './pieces.constants';

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export function readPlacement(fen: string): Map<string, Piece> {
  const placement = new Map<string, Piece>();

  for (const [index, row] of fen.split(' ')[0].split('/').entries()) {
    let file = 0;
    for (const symbol of row) {
      const skipped = Number(symbol);
      if (Number.isNaN(skipped)) {
        placement.set(`${FILES[file]}${8 - index}`, PIECES[symbol]);
        file += 1;
      } else {
        file += skipped;
      }
    }
  }

  return placement;
}
