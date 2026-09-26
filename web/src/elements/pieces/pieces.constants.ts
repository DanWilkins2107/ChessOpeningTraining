// fallow-ignore-file unused-file -- ef93ff81 2026-10-15 landed ahead of the study page, its first consumer.
// The images are the cburnett set; the LICENSE.txt beside this file is their
// licence and names each file, so moving them means updating it too.
import bB from './bB.svg';
import bK from './bK.svg';
import bN from './bN.svg';
import bP from './bP.svg';
import bQ from './bQ.svg';
import bR from './bR.svg';
import wB from './wB.svg';
import wK from './wK.svg';
import wN from './wN.svg';
import wP from './wP.svg';
import wQ from './wQ.svg';
import wR from './wR.svg';

export type Piece = { name: string; image: string };

export const PIECES: Record<string, Piece> = {
  K: { name: 'white king', image: wK },
  Q: { name: 'white queen', image: wQ },
  R: { name: 'white rook', image: wR },
  B: { name: 'white bishop', image: wB },
  N: { name: 'white knight', image: wN },
  P: { name: 'white pawn', image: wP },
  k: { name: 'black king', image: bK },
  q: { name: 'black queen', image: bQ },
  r: { name: 'black rook', image: bR },
  b: { name: 'black bishop', image: bB },
  n: { name: 'black knight', image: bN },
  p: { name: 'black pawn', image: bP },
};
