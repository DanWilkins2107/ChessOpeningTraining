import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { FolderItem } from './FolderItem';

it('shows the folder name beside a folder icon', () => {
  // Given a folder called London
  const folder = { id: 'a4f1', name: 'London', parent_id: null };

  // When its row renders
  render(
    <ul>
      <FolderItem folder={folder} />
    </ul>,
  );

  // Then the row holds the name and the folder icon
  const row = screen.getByRole('listitem');
  expect(row).toHaveTextContent('London');
  expect(row.querySelector('.folder-tile')).toBeInTheDocument();
});
