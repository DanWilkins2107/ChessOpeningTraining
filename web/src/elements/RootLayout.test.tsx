import { act, render, screen } from '@testing-library/react';
import { use } from 'react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import { RootLayout } from './RootLayout';

const never = new Promise<never>(() => {});

function SuspendedPage() {
  return use(never);
}

it('shows the header while the page is still loading', async () => {
  const router = createMemoryRouter([
    {
      element: <RootLayout />,
      children: [{ index: true, element: <SuspendedPage /> }],
    },
  ]);

  await act(async () => render(<RouterProvider router={router} />));

  expect(screen.getByRole('banner')).toBeInTheDocument();
  expect(screen.getByRole('main')).toHaveTextContent('Loading…');
});
