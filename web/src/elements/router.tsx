import { createBrowserRouter } from 'react-router-dom';
import { ProtectedLayout } from './ProtectedLayout';
import {
  ACCOUNT_ROUTE_PATH,
  PROTECTED_ROUTE_HANDLE,
  ROOT_ROUTE_PATH,
  STUDIES_ROUTE_PATH,
} from './router.constants';
import { RootLayout } from './RootLayout';
import { Account } from '../pages/Account/page';
import { Home } from '../pages/Home/page';
import { NotFound } from '../pages/NotFound/page';
import { SignIn } from '../pages/SignIn/page';
import { SignUp } from '../pages/SignUp/page';
import { Studies } from '../pages/Studies/page';

export const router = createBrowserRouter([
  {
    path: ROOT_ROUTE_PATH,
    element: <RootLayout />,
    children: [
      {
        element: <ProtectedLayout />,
        handle: PROTECTED_ROUTE_HANDLE,
        children: [
          { index: true, element: <Home /> },
          { path: ACCOUNT_ROUTE_PATH, element: <Account /> },
          { path: STUDIES_ROUTE_PATH, element: <Studies /> },
        ],
      },
      { path: 'sign-in', element: <SignIn /> },
      { path: 'sign-up', element: <SignUp /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
