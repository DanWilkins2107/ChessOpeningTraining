import { render } from '@testing-library/react';
import { expect, it } from 'vitest';
import { FolderTile } from './FolderTile';

it('shows a folder icon', () => {
  // Given a folder row
  const { container } = render(<FolderTile />);

  // When the tile renders

  // Then it holds the folder icon
  expect(
    container.querySelector('.folder-tile .folder-tile-icon'),
  ).toBeInTheDocument();
});
