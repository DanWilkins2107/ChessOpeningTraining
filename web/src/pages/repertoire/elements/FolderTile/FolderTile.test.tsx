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

it('is the regular size by default', () => {
  // Given a folder row
  const { container } = render(<FolderTile />);

  // When the tile renders

  // Then it isn't the large tile
  expect(container.querySelector('.folder-tile-large')).not.toBeInTheDocument();
});

it('can be large', () => {
  // Given a large folder tile
  const { container } = render(<FolderTile large />);

  // When the tile renders

  // Then it is the large tile
  expect(
    container.querySelector('.folder-tile.folder-tile-large'),
  ).toBeInTheDocument();
});
