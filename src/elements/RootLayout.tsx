import { Link, Outlet } from 'react-router-dom';

export function RootLayout() {
  return (
    <>
      <header>
        <Link to="/">Chess Opening Training</Link>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
