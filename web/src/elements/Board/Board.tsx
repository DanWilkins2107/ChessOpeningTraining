// fallow-ignore-file unused-file -- 61043e76 2026-11-17 landed ahead of the move tree page, its first consumer.
import type { ComponentProps } from 'react';
import { LoadBoundary } from '../../shared/LoadBoundary/LoadBoundary';
import { AwaitedBoard } from '../AwaitedBoard/AwaitedBoard';
import { BoardLoading } from '../BoardLoading/BoardLoading';

// A failed position keeps the board loading; the caller shows the error.
export function Board(props: ComponentProps<typeof AwaitedBoard>) {
  return (
    <LoadBoundary Loading={BoardLoading} LoadError={BoardLoading}>
      <AwaitedBoard {...props} />
    </LoadBoundary>
  );
}
