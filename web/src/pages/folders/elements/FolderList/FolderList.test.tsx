import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import { FolderList } from './FolderList';

it("links each folder, named by the folder, to that folder's page", () => {
  // Given two folders
  const data = [
    { id: 'a4f1', name: 'London', side: 'white' as const },
    { id: 'b7c2', name: 'Caro-Kann', side: 'black' as const },
  ];

  // When the list renders
  render(
    <FolderList
      response={{
        success: true,
        data,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK',
      }}
    />,
    { wrapper: MemoryRouter },
  );

  // Then each row links to its own folder page, named by the folder alone
  expect(screen.getByRole('link', { name: 'London' })).toHaveAttribute(
    'href',
    '/folders/a4f1',
  );
  expect(screen.getByRole('link', { name: 'Caro-Kann' })).toHaveAttribute(
    'href',
    '/folders/b7c2',
  );
});
