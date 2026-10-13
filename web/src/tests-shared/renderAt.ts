import { createElement } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { createQueryClient } from '../elements/createQueryClient/createQueryClient';
import { router } from '../elements/router/router';
import { authSettled } from './authSettled';

export function renderAt(...entries: string[]) {
  const memoryRouter = createMemoryRouter(router.routes, {
    initialEntries: entries,
  });
  render(
    createElement(
      QueryClientProvider,
      { client: createQueryClient() },
      createElement(RouterProvider, { router: memoryRouter }),
    ),
  );
  return memoryRouter;
}

export const pathOf = ({ state }: ReturnType<typeof renderAt>) =>
  state.location.pathname + state.location.search;

export async function renderSettledAt(path: string) {
  const memoryRouter = renderAt(path);
  await authSettled();
  return memoryRouter;
}
