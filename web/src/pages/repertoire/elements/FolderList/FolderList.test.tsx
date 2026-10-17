import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import { createQueryClient } from '../../../../elements/createQueryClient/createQueryClient';
import { FOLDERS_QUERY_KEY } from '../useFolders/useFolders.constants';
import { FolderList } from './FolderList';

it("links each folder, named by the folder, to that folder's page", () => {
  // Given two folders, already loaded for the user
  const queryClient = createQueryClient();
  queryClient.setQueryData(
    [FOLDERS_QUERY_KEY, 'u1'],
    [
      { id: 'a4f1', name: 'London' },
      { id: 'b7c2', name: 'Caro-Kann' },
    ],
  );

  // When the list renders
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <FolderList userId="u1" />
      </MemoryRouter>
    </QueryClientProvider>,
  );

  // Then each row links to its own folder page, named by the folder alone
  expect(screen.getByRole('link', { name: 'London' })).toHaveAttribute(
    'href',
    '/repertoire/a4f1',
  );
  expect(screen.getByRole('link', { name: 'Caro-Kann' })).toHaveAttribute(
    'href',
    '/repertoire/b7c2',
  );
});
