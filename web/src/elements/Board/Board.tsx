// fallow-ignore-file unused-file -- 61043e76 2026-11-17 landed ahead of the move tree page, its first consumer.
import type { ComponentProps } from 'react';
import { LoadBoundary } from '../../shared/LoadBoundary/LoadBoundary';
import { BoardLoading } from '../BoardLoading/BoardLoading';
import { LoadedBoard } from '../LoadedBoard/LoadedBoard';

export function Board(props: ComponentProps<typeof LoadedBoard>) {
  return (
    <LoadBoundary Loading={BoardLoading} LoadError={BoardLoading}>
      <LoadedBoard {...props} />
    </LoadBoundary>
  );
}
