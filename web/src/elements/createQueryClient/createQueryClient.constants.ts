import type { DefaultOptions } from '@tanstack/react-query';

export const QUERY_CLIENT_DEFAULT_OPTIONS: DefaultOptions = {
  queries: { retry: false },
  mutations: { retry: false },
};
