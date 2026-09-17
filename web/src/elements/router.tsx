import { createBrowserRouter } from 'react-router-dom';
import { ProtectedLayout } from './ProtectedLayout';
import { ACCOUNT_ROUTE_PATH, ROOT_ROUTE_PATH } from './router.constants';
import { RootLayout } from './RootLayout';
import { Account } from '../pages/Account/page';
import { ForgotPassword } from '../pages/ForgotPassword/page';
import { Home } from '../pages/Home/page';
import { NotFound } from '../pages/NotFound/page';
import { SetNewPassword } from '../pages/SetNewPassword/page';
import { SignIn } from '../pages/SignIn/page';
import { SignUp } from '../pages/SignUp/page';

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
        ],
      },
      { path: 'sign-in', element: <SignIn /> },
      { path: 'sign-up', element: <SignUp /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'set-new-password', element: <SetNewPassword /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
