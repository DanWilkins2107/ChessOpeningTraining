import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { router } from './router';

const routesOf = (path: string[]) =>
  createMemoryRouter(router.routes, { initialEntries: path });

it('renders the home page inside the root layout at /', () => {
  render(<RouterProvider router={routesOf(['/'])} />);

  expect(screen.getByRole('banner')).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: 'Chess Opening Training' }),
  ).toBeInTheDocument();
});

it('renders the design token specimen at /theme', () => {
  render(<RouterProvider router={routesOf(['/theme'])} />);

  expect(
    screen.getByRole('heading', { level: 1, name: 'Design tokens' }),
  ).toBeInTheDocument();
});

it('renders the not-found page for an unknown path', () => {
  render(<RouterProvider router={routesOf(['/no-such-page'])} />);

  expect(
    screen.getByRole('heading', { name: 'Page not found' }),
  ).toBeInTheDocument();
});
