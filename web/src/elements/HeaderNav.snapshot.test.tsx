import { render } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { HeaderNav } from './HeaderNav';
import { PROTECTED_ROUTE_HANDLE } from './router.constants';

describe('HeaderNav', () => {
  it('matches snapshot', () => {
    const router = createMemoryRouter([
      { path: '/', element: <HeaderNav />, handle: PROTECTED_ROUTE_HANDLE },
    ]);
    const { container } = render(<RouterProvider router={router} />);
    expect(container).toMatchSnapshot();
  });
});
