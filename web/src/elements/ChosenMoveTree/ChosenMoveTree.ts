// fallow-ignore-file unused-file -- 3c64798f 2026-11-22 landed ahead of Exercises (c42b3cac), its first consumer.
import type { MoveNode } from '../MoveNode/MoveNode';

export type ChosenMoveTree = {
  id: string;
  side: 'white' | 'black';
  moves: MoveNode[];
};
