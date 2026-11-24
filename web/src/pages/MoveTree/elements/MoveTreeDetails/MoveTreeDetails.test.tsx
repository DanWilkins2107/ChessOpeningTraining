import { screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { renderMoveTreeDetails } from '../../tests-shared/moveTreeDetails';

const board = () => screen.findByRole('grid', { name: 'Chess board' });

const cornerSquares = async () => {
  const rows = within(await board()).getAllByRole('row');
  const firstCell = (row: HTMLElement) =>
    within(row).getAllByRole('gridcell')[0]!.getAttribute('aria-label');
  return [firstCell(rows[0]!), firstCell(rows.at(-1)!)];
};

it('heads the panel with the move tree name', async () => {
  // Given a move tree called Main line
  // When its details render
  renderMoveTreeDetails({ name: 'Main line', side: 'white' });

  // Then the heading is its name
  expect(
    await screen.findByRole('heading', { level: 1, name: 'Main line' }),
  ).toBeInTheDocument();
});

it.each([
  ['white', ['a8, black rook', 'a1, white rook']],
  ['black', ['h1, white rook', 'h8, black rook']],
] as const)(
  'shows the start position from the %s side',
  async (side, corners) => {
    // Given a move tree for that side
    // When its details render
    renderMoveTreeDetails({ name: 'Main line', side });

    // Then the board shows the start position with that side at the bottom
    expect(await cornerSquares()).toEqual(corners);
  },
);

it('takes no moves on the board', async () => {
  // Given a move tree
  // When its details render
  renderMoveTreeDetails({ name: 'Main line', side: 'white' });

  // Then the board isn't interactive
  expect((await board()).closest('.board')).not.toHaveClass(
    'board-interactive',
  );
});
