import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createQueryClient } from '../../../../../elements/createQueryClient/createQueryClient';
import { FOLDER_QUERY_KEY } from '../useFolder/useFolder.constants';
import { FolderContents } from './FolderContents';

const USER_ID = '2b1f0c9e-3d4a-4b5c-8d6e-7f8091a2b3c4';
const FOLDER_ID = '7c3e1d2a-5b4f-4e6a-9c8d-1f2e3a4b5c6d';

describe('FolderContents', () => {
  it.each([
    ['a folder', { name: 'London', move_trees: [] }],
    ['no folder', null],
  ])('matches snapshot with %s', (_, folder) => {
    const client = createQueryClient();
    client.setQueryData([FOLDER_QUERY_KEY, USER_ID, FOLDER_ID], folder);
    const { container } = render(
      <QueryClientProvider client={client}>
        <FolderContents userId={USER_ID} folderId={FOLDER_ID} />
      </QueryClientProvider>,
    );
    expect(container).toMatchSnapshot();
  });
});
