import { QueryClient } from '@tanstack/react-query';
import { QUERY_CLIENT_DEFAULT_OPTIONS } from './createQueryClient.constants';

export const createQueryClient = () =>
  new QueryClient({ defaultOptions: QUERY_CLIENT_DEFAULT_OPTIONS });
