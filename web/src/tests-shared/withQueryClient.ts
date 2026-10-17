import { createElement } from 'react';
import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '../elements/createQueryClient/createQueryClient';

export const withQueryClient = (ui: ReactNode) =>
  createElement(QueryClientProvider, { client: createQueryClient() }, ui);
