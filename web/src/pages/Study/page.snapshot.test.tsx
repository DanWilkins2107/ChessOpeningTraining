import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { STUDY_ROUTE_PATH } from '../../shared/routes/routes.constants';
import { Study } from './page';

describe('Study', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <MemoryRouter
        initialEntries={['/studies/7c3e1d2a-5b4f-4e6a-9c8d-1f2e3a4b5c6d']}
      >
        <Routes>
          <Route path={STUDY_ROUTE_PATH} element={<Study />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });
});
