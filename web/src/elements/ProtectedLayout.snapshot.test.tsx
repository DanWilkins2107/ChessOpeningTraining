import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ProtectedLayout } from './ProtectedLayout';

describe('ProtectedLayout', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <MemoryRouter>
        <Routes>
          <Route element={<ProtectedLayout />}>
            <Route index element={<h1>Protected page</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });
});
