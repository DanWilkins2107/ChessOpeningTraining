// fallow-ignore-file unused-file -- 61043e76 2026-11-17 landed ahead of the move tree page, its first consumer.
import { use } from 'react';
import type { ComponentProps } from 'react';
import { LoadedBoard } from '../LoadedBoard/LoadedBoard';

type AwaitedBoardProps = Omit<
  ComponentProps<typeof LoadedBoard>,
  'position'
> & {
  position: Promise<string>;
};

export function AwaitedBoard({ position, ...props }: AwaitedBoardProps) {
  return <LoadedBoard position={use(position)} {...props} />;
}
