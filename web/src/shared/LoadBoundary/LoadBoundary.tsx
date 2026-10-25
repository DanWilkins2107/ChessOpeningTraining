import { Suspense } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

type LoadBoundaryProps = {
  // null when the content handles its own loading.
  Loading: ComponentType | null;
  LoadError: ComponentType;
  children: ReactNode;
};

export function LoadBoundary({
  Loading,
  LoadError,
  children,
}: LoadBoundaryProps) {
  return (
    <ErrorBoundary fallback={<LoadError />}>
      <Suspense fallback={Loading && <Loading />}>{children}</Suspense>
    </ErrorBoundary>
  );
}
