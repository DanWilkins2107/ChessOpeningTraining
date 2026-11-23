import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { PawnTile } from './PawnTile';

it('shows a white pawn for a white tree', () => {
  // Given a white move tree
  render(<PawnTile side="white" />);

  // When the tile renders

  // Then it holds the white pawn
  expect(screen.getByRole('img', { name: 'white pawn' })).toBeInTheDocument();
});

it('shows a black pawn for a black tree', () => {
  // Given a black move tree
  render(<PawnTile side="black" />);

  // When the tile renders

  // Then it holds the black pawn
  expect(screen.getByRole('img', { name: 'black pawn' })).toBeInTheDocument();
});

it('is the regular size by default', () => {
  // Given a move tree row
  const { container } = render(<PawnTile side="white" />);

  // When the tile renders

  // Then it isn't the large tile
  expect(container.querySelector('.pawn-tile-large')).not.toBeInTheDocument();
});

it('can be large', () => {
  // Given a large pawn tile
  const { container } = render(<PawnTile side="white" large />);

  // When the tile renders

  // Then it is the large tile
  expect(
    container.querySelector('.pawn-tile.pawn-tile-large'),
  ).toBeInTheDocument();
});
