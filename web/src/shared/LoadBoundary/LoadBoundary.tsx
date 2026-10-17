// fallow-ignore-file unused-file -- 61043e76 2026-11-16 Account moved to LoadErrorBoundary; the move tree page (PR 116) is its next consumer.
import { Suspense } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { LoadErrorBoundary } from '../LoadErrorBoundary/LoadErrorBoundary';

type LoadBoundaryProps = {
  Loading: ComponentType;
  LoadError: ComponentType<{ retry: () => void }>;
  children: ReactNode;
};

export function LoadBoundary({
  Loading,
  LoadError,
  children,
}: LoadBoundaryProps) {
  return (
    <LoadErrorBoundary LoadError={LoadError}>
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </LoadErrorBoundary>
  );
}
