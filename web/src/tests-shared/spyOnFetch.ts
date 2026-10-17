import { vi } from 'vitest';

// mock-reason: spying only, to see which requests go out. Every request is
// sent for real.
export const spyOnFetch = () => vi.spyOn(window, 'fetch');
