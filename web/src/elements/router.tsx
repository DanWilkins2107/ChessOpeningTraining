import { createBrowserRouter } from 'react-router-dom';
import { ROOT_ROUTE_PATH } from './router.constants';
import { RootLayout } from './RootLayout';
import { Home } from '../pages/Home/page';
import { NotFound } from '../pages/NotFound/page';

export const router = createBrowserRouter([
  {
    path: ROOT_ROUTE_PATH,
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
