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
