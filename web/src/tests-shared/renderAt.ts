import { createElement } from 'react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { router } from '../elements/router';
import { authSettled } from './authSettled';

export function renderAt(...entries: string[]) {
  const memoryRouter = createMemoryRouter(router.routes, {
    initialEntries: entries,
  });
  render(createElement(RouterProvider, { router: memoryRouter }));
  return memoryRouter;
}

export const pathOf = ({ state }: ReturnType<typeof renderAt>) =>
  state.location.pathname + state.location.search;

export async function renderSettledAt(path: string) {
  const memoryRouter = renderAt(path);
  await authSettled();
  return memoryRouter;
}
