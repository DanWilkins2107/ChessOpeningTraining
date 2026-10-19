import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

type LoadBoundaryProps = {
  // null when the content handles its own loading.
  Loading: ComponentType | null;
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
      <Suspense fallback={Loading && <Loading />}>{children}</Suspense>
    </ErrorBoundary>
  );
}
