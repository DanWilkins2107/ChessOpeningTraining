import { render } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { HeaderNav } from './HeaderNav';
import { PROTECTED_ROUTE_HANDLE } from '../../shared/router/router.constants';

function renderNav(handle?: typeof PROTECTED_ROUTE_HANDLE) {
  const router = createMemoryRouter([
    { path: '/', element: <HeaderNav />, handle },
  ]);
  return render(<RouterProvider router={router} />).container;
}

describe('HeaderNav', () => {
  it('matches snapshot on a protected page', () => {
    expect(renderNav(PROTECTED_ROUTE_HANDLE)).toMatchSnapshot();
  });

  it('matches snapshot on a public page', () => {
    expect(renderNav()).toMatchSnapshot();
  });
});
