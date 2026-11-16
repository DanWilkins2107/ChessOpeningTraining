import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import { MoveTreeItem } from './MoveTreeItem';

it("links to the move tree's page, with a pawn for its side", () => {
  // Given a black move tree
  const moveTree = {
    id: 'e5f6',
    name: 'Sicilian',
    side: 'black',
    folder_id: null,
  } as const;

  // When its row renders
  render(
    <ul>
      <MoveTreeItem moveTree={moveTree} />
    </ul>,
    { wrapper: MemoryRouter },
  );

  // Then the row links to the tree and shows the black pawn
  expect(screen.getByRole('link', { name: /Sicilian/ })).toHaveAttribute(
    'href',
    '/tree/e5f6',
  );
  expect(screen.getByRole('img', { name: 'black pawn' })).toBeInTheDocument();
});
