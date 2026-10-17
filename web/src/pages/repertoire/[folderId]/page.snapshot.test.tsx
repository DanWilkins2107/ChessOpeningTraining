import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { FOLDER_ROUTE_PATH } from '../router.constants';
import { Folder } from './page';
import { withQueryClient } from '../../../tests-shared/withQueryClient';

describe('Folder', () => {
  it('matches snapshot', () => {
    const { container } = render(
      withQueryClient(
        <MemoryRouter
          initialEntries={['/repertoire/7c3e1d2a-5b4f-4e6a-9c8d-1f2e3a4b5c6d']}
        >
          <Routes>
            <Route path={FOLDER_ROUTE_PATH} element={<Folder />} />
          </Routes>
        </MemoryRouter>,
      ),
    );
    expect(container).toMatchSnapshot();
  });
});
