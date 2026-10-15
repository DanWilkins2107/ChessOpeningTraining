// fallow-ignore-file unused-file -- 94afaf5e 2026-11-12 landed ahead of the folders list, its first consumer.
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

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
  const { reset } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      onReset={reset}
      fallbackRender={({ resetErrorBoundary }) => (
        <LoadError retry={resetErrorBoundary} />
      )}
    >
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </ErrorBoundary>
  );
}
