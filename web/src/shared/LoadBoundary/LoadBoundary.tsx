// fallow-ignore-file unused-file -- 94afaf5e 2026-11-12 landed ahead of the folders list, its first consumer.
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '../Button/Button';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { Spinner } from '../Spinner/Spinner';
import './LoadBoundary.css';

type LoadBoundaryProps = {
  label: string;
  error: string;
  children: ReactNode;
};

export function LoadBoundary({ label, error, children }: LoadBoundaryProps) {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      onReset={reset}
      fallbackRender={({ resetErrorBoundary }) => (
        <form className="load-boundary-error" action={resetErrorBoundary}>
          <ErrorMessage>{error}</ErrorMessage>
          <Button disabled={false}>Try again</Button>
        </form>
      )}
    >
      <Suspense fallback={<Spinner label={label} />}>{children}</Suspense>
    </ErrorBoundary>
  );
}
