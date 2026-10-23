import type { ChosenMoveTree } from '../elements/ChosenMoveTree/ChosenMoveTree';
import type { MoveNode } from '../elements/MoveNode/MoveNode';

export const move = (san: string, ...children: MoveNode[]): MoveNode => ({
  san,
  children,
});

export const rated = (
  confidence: number,
  san: string,
  ...children: MoveNode[]
): MoveNode => ({ san, confidence, children });

export const chosenTree = (
  id: string,
  moves: MoveNode[],
  side: ChosenMoveTree['side'] = 'white',
): ChosenMoveTree => ({ id, side, moves });

export const leaves = (count: number) =>
  Array.from({ length: count }, (_, index) => move(`m${index}`));
