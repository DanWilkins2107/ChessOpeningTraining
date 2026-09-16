import { createElement } from 'react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { router } from '../elements/router';

export function renderAt(...entries: string[]) {
  const memoryRouter = createMemoryRouter(router.routes, {
    initialEntries: entries,
  });
  render(createElement(RouterProvider, { router: memoryRouter }));
  return memoryRouter;
}

export const pathOf = ({ state }: ReturnType<typeof renderAt>) =>
  state.location.pathname + state.location.search;
