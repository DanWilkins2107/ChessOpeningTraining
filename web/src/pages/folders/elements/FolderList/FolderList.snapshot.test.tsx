import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { createQueryClient } from '../../../../elements/createQueryClient/createQueryClient';
import { FOLDERS_QUERY_KEY } from '../useFolders/useFolders.constants';
import { FolderList } from './FolderList';

describe('FolderList', () => {
  it('matches snapshot', () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(
      [FOLDERS_QUERY_KEY, 'u1'],
      [{ id: 'a4f1', name: 'London' }],
    );
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <FolderList userId="u1" />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(container).toMatchSnapshot();
  });
});
