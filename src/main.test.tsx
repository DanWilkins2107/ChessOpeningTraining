import { beforeEach, expect, it, vi } from 'vitest';

const { createRoot, render } = vi.hoisted(() => {
  const render = vi.fn();
  return { render, createRoot: vi.fn(() => ({ render })) };
});

// mock-reason: the createRoot/render pair is the assertion — main's whole
// contract is "mount the router into #root exactly once" — and the real
// createRoot would render the app tree instead of letting us observe the call.
vi.mock('react-dom/client', () => ({ createRoot }));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  document.body.innerHTML = '';
});

it('mounts the router into #root', async () => {
  document.body.innerHTML = '<div id="root"></div>';

  await import('./main');

  expect(createRoot).toHaveBeenCalledExactlyOnceWith(
    document.getElementById('root'),
  );
  expect(render).toHaveBeenCalledOnce();
});

it('refuses to mount when index.html has no #root', async () => {
  await expect(import('./main')).rejects.toThrow(
    'Root element #root not found in index.html',
  );
  expect(createRoot).not.toHaveBeenCalled();
});
