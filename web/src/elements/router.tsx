import { createBrowserRouter } from 'react-router-dom';
import { ProtectedLayout } from './ProtectedLayout';
import {
  ACCOUNT_ROUTE_PATH,
  PROFILE_ROUTE_PATH,
  ROOT_ROUTE_PATH,
} from './router.constants';
import { RootLayout } from './RootLayout';
import { Account } from '../pages/Account/page';
import { Home } from '../pages/Home/page';
import { NotFound } from '../pages/NotFound/page';
import { Profile } from '../pages/Profile/page';
import { SignIn } from '../pages/SignIn/page';

export const router = createBrowserRouter([
  {
    path: ROOT_ROUTE_PATH,
    element: <RootLayout />,
    children: [
      {
        element: <ProtectedLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: ACCOUNT_ROUTE_PATH, element: <Account /> },
          { path: PROFILE_ROUTE_PATH, element: <Profile /> },
        ],
      },
      { path: 'sign-in', element: <SignIn /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
