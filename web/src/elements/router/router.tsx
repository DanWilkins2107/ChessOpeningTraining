import { createBrowserRouter } from 'react-router-dom';
import { ProtectedLayout } from '../ProtectedLayout/ProtectedLayout';
import {
  ACCOUNT_ROUTE_PATH,
  CHANGE_PASSWORD_ROUTE_PATH,
  DELETE_ACCOUNT_ROUTE_PATH,
  PROTECTED_ROUTE_HANDLE,
  ROOT_ROUTE_PATH,
} from '../routes/routes.constants';
import {
  FOLDERS_ROUTE_PATH,
  FOLDER_ROUTE_PATH,
} from '../../pages/folders/router.constants';
import { MOVE_TREE_ROUTE_PATH } from '../../pages/MoveTree/router.constants';
import { RootLayout } from '../RootLayout/RootLayout';
import { Account } from '../../pages/Account/page';
import { ChangePassword } from '../../pages/ChangePassword/page';
import { DeleteAccount } from '../../pages/DeleteAccount/page';
import { ForgotPassword } from '../../pages/ForgotPassword/page';
import { Home } from '../../pages/Home/page';
import { NotFound } from '../../pages/NotFound/page';
import { SetNewPassword } from '../../pages/SetNewPassword/page';
import { SignIn } from '../../pages/SignIn/page';
import { SignUp } from '../../pages/SignUp/page';
import { Folders } from '../../pages/folders/page';
import { Folder } from '../../pages/folders/[folderId]/page';
import { MoveTree } from '../../pages/MoveTree/page';

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
          { path: CHANGE_PASSWORD_ROUTE_PATH, element: <ChangePassword /> },
          { path: DELETE_ACCOUNT_ROUTE_PATH, element: <DeleteAccount /> },
          { path: FOLDERS_ROUTE_PATH, element: <Folders /> },
          { path: FOLDER_ROUTE_PATH, element: <Folder /> },
          { path: MOVE_TREE_ROUTE_PATH, element: <MoveTree /> },
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
