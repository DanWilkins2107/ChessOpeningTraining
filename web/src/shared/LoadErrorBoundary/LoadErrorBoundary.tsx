import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import type { ComponentType, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

type LoadErrorBoundaryProps = {
  LoadError: ComponentType<{ retry: () => void }>;
  children: ReactNode;
};

export function LoadErrorBoundary({
  LoadError,
  children,
}: LoadErrorBoundaryProps) {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      onReset={reset}
      fallbackRender={({ resetErrorBoundary }) => (
        <LoadError retry={resetErrorBoundary} />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
