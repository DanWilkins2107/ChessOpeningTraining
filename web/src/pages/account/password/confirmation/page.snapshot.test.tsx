import { render } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ChangePasswordConfirmation } from './page';

describe('ChangePasswordConfirmation', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <MemoryRouter>
        <Routes>
          <Route element={<Outlet context="Aa1!new-password" />}>
            <Route index element={<ChangePasswordConfirmation />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });
});
