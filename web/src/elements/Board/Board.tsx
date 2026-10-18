// fallow-ignore-file unused-file -- 61043e76 2026-11-17 landed ahead of the move tree page, its first consumer.
import { Suspense, useMemo } from 'react';
import type { ComponentProps } from 'react';
import { AwaitedBoard } from '../AwaitedBoard/AwaitedBoard';
import { BoardLoading } from '../BoardLoading/BoardLoading';

const NEVER = new Promise<never>(() => {});

export function Board({
  position,
  ...props
}: ComponentProps<typeof AwaitedBoard>) {
  // A failed position keeps the board loading; the caller shows the error.
  const settled = useMemo(() => position.catch(() => NEVER), [position]);

  return (
    <Suspense fallback={<BoardLoading />}>
      <AwaitedBoard position={settled} {...props} />
    </Suspense>
  );
}
