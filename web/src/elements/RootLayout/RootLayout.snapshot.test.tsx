import { render } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { RootLayout } from './RootLayout';

describe('RootLayout', () => {
  it('matches snapshot', () => {
    const memoryRouter = createMemoryRouter([
      { path: '/', element: <RootLayout /> },
    ]);
    const { container } = render(<RouterProvider router={memoryRouter} />);
    expect(container).toMatchSnapshot();
  });
});
