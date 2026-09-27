import { act } from '@testing-library/react';
import { expect, vi } from 'vitest';

// Holds the first request that matches, then sends it for real on answer(); the
// rest go straight through. For letting a later response overtake it.
export function holdFirstRequest(
  matches: (input: RequestInfo | URL) => boolean,
) {
  const realFetch = window.fetch;
  let release = () => {};
  const released = new Promise<void>((resolve) => (release = resolve));
  let held: Promise<Response> | undefined;
  // mock-reason: the local server answers too fast to overtake. Every request
  // is sent for real; only the first match waits.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) => {
    if (held || !matches(input)) return realFetch(input, init);
    held = released.then(() => realFetch(input, init));
    return held;
  });

  return {
    sent: () => vi.waitFor(() => expect(held).toBeDefined()),
    async answer() {
      release();
      const response = await held!;
      await vi.waitFor(() => expect(response.bodyUsed).toBe(true));
      await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
    },
  };
}
