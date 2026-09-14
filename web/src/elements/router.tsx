import { createBrowserRouter } from 'react-router-dom';
import { ProtectedLayout } from './ProtectedLayout';
import { ROOT_ROUTE_PATH } from './router.constants';
import { RootLayout } from './RootLayout';
import { Home } from '../pages/Home/page';
import { NotFound } from '../pages/NotFound/page';
import { SignIn } from '../pages/SignIn/page';

export const router = createBrowserRouter([
  {
    path: ROOT_ROUTE_PATH,
    element: <RootLayout />,
    children: [
      {
        element: <ProtectedLayout />,
        children: [{ index: true, element: <Home /> }],
      },
      { path: 'sign-in', element: <SignIn /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
