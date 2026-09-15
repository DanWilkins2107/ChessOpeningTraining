import type { MoveNode } from '../elements/moveTree';

export const move = (san: string, ...children: MoveNode[]): MoveNode => ({
  san,
  children,
});
