import { createBrowserRouter } from 'react-router-dom';
import { ProtectedLayout } from '../ProtectedLayout/ProtectedLayout';
import {
  ACCOUNT_EMAIL_ROUTE_PATH,
  CHANGE_PASSWORD_ROUTE_PATH,
  PROTECTED_ROUTE_HANDLE,
  ROOT_ROUTE_PATH,
} from '../routes/routes.constants';
import {
  REPERTOIRE_ROUTE_PATH,
  FOLDER_ROUTE_PATH,
} from '../../pages/repertoire/router.constants';
import { ACCOUNT_ROUTE_PATH } from '../../pages/account/router.constants';
import { RootLayout } from '../RootLayout/RootLayout';
import { Account } from '../../pages/account/page';
import { FORGOT_PASSWORD_ROUTE_PATH } from '../../pages/(auth)/forgot-password/router.constants';
import { SET_NEW_PASSWORD_ROUTE_PATH } from '../../pages/(auth)/set-new-password/router.constants';
import { SIGN_IN_ROUTE_PATH } from '../../pages/(auth)/sign-in/router.constants';
import { SIGN_UP_ROUTE_PATH } from '../../pages/(auth)/sign-up/router.constants';
import { ChangeEmail } from '../../pages/ChangeEmail/page';
import { ChangePassword } from '../../pages/ChangePassword/page';
import { ChangePasswordConfirmation } from '../../pages/ChangePassword/confirmation/page';
import { CHANGE_PASSWORD_CONFIRMATION_ROUTE_PATH } from '../../pages/ChangePassword/router.constants';
import { DeleteAccount } from '../../pages/account/delete/page';
import { DELETE_ACCOUNT_ROUTE_PATH } from '../../pages/account/delete/router.constants';
import { ForgotPassword } from '../../pages/(auth)/forgot-password/page';
import { Home } from '../../pages/Home/page';
import { NotFound } from '../../pages/NotFound/page';
import { SetNewPassword } from '../../pages/(auth)/set-new-password/page';
import { SignIn } from '../../pages/(auth)/sign-in/page';
import { SignUp } from '../../pages/(auth)/sign-up/page';
import { Repertoire } from '../../pages/repertoire/page';
import { Folder } from '../../pages/repertoire/[folderId]/page';

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
          { path: ACCOUNT_EMAIL_ROUTE_PATH, element: <ChangeEmail /> },
          {
            path: CHANGE_PASSWORD_ROUTE_PATH,
            element: <ChangePassword />,
            children: [
              {
                path: CHANGE_PASSWORD_CONFIRMATION_ROUTE_PATH,
                element: <ChangePasswordConfirmation />,
              },
            ],
          },
          { path: DELETE_ACCOUNT_ROUTE_PATH, element: <DeleteAccount /> },
          { path: REPERTOIRE_ROUTE_PATH, element: <Repertoire /> },
          { path: FOLDER_ROUTE_PATH, element: <Folder /> },
        ],
      },
      { path: SIGN_IN_ROUTE_PATH, element: <SignIn /> },
      { path: SIGN_UP_ROUTE_PATH, element: <SignUp /> },
      { path: FORGOT_PASSWORD_ROUTE_PATH, element: <ForgotPassword /> },
      { path: SET_NEW_PASSWORD_ROUTE_PATH, element: <SetNewPassword /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
