import { beforeEach, expect, it, vi } from 'vitest';

const { createRoot, render } = vi.hoisted(() => {
  const render = vi.fn();
  return { render, createRoot: vi.fn(() => ({ render })) };
});

vi.mock('react-dom/client', () => ({ createRoot }));
vi.mock('./env', () => ({ env: {} }));

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
