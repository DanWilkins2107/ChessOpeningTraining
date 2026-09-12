import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './elements/RootLayout';
import { Home } from './pages/Home/page';
import { NotFound } from './pages/NotFound/page';
import { Theme } from './pages/Theme/page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'theme', element: <Theme /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
