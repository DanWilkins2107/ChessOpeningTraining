import type { MoveNode } from '../elements/moveTree/moveTree';

export const move = (san: string, ...children: MoveNode[]): MoveNode => ({
  san,
  children,
});

export const leaves = (count: number) =>
  Array.from({ length: count }, (_, index) => move(`m${index}`));
