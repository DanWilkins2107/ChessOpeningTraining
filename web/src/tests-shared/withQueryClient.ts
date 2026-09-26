import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { ReactNode } from 'react';

// A fresh client per render keeps one test's cache out of the next, and
// without retries a failed request shows its error straight away.
export const withQueryClient = (children: ReactNode) =>
  createElement(
    QueryClientProvider,
    {
      client: new QueryClient({
        defaultOptions: { queries: { retry: false } },
      }),
    },
    children,
  );
