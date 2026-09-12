import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './elements/RootLayout';
import { Home } from './pages/Home/page';
import { NotFound } from './pages/NotFound/page';

export const router = createBrowserRouter([
  {
    // Stryker disable next-line StringLiteral: '' and '/' resolve to the same
    // root match, so no test can tell them apart while this is the only
    // top-level route. Drop this line if a sibling top-level route is added.
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
