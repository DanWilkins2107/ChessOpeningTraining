import { act } from '@testing-library/react';
import { expect, vi } from 'vitest';

// Holds the first request matching until released, then sends it for real; the
// rest go straight through.
export function holdFirstRequest(
  matches: (input: RequestInfo | URL) => boolean,
) {
  const realFetch = window.fetch;
  let release = () => {};
  const released = new Promise<void>((resolve) => (release = resolve));
  let held: Promise<Response> | undefined;
  // mock-reason: the local server answers too fast for a later request to
  // overtake an earlier one. Every call is still real.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) => {
    if (held || !matches(input)) return realFetch(input, init);
    held = released.then(() => realFetch(input, init));
    return held;
  });

  return {
    isHeld: () => held !== undefined,
    // Releases the held request and waits until the page has had its response.
    async releaseAndSettle() {
      release();
      const response = await held!;
      await vi.waitFor(() => expect(response.bodyUsed).toBe(true));
      await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
    },
    release,
  };
}
