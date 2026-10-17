import { vi } from 'vitest';

export const isMoveTreesRequest = (input: RequestInfo | URL) =>
  String(input).includes('/rest/v1/move_trees');

// mock-reason: spying only, to see which requests go out. Every request is
// sent for real.
export const spyOnFetch = () => vi.spyOn(window, 'fetch');
