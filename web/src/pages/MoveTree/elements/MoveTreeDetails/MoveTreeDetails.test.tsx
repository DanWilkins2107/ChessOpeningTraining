import type { User } from '@supabase/supabase-js';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { authUserQuery } from '../../../../elements/authUserQuery/authUserQuery';
import { createQueryClient } from '../../../../elements/createQueryClient/createQueryClient';
import { MOVE_TREE_QUERY_KEY } from '../useMoveTree/useMoveTree.constants';
import { MoveTreeDetails } from './MoveTreeDetails';

const MOVE_TREE_ID = '7c3e1d2a-5b4f-4e6a-9c8d-1f2e3a4b5c6d';

function renderWith(moveTree: { name: string; side: 'white' | 'black' }) {
  const client = createQueryClient();
  // as-reason: the move tree query reads only the user's id, and a full
  // supabase User has a dozen required fields that would mean nothing here.
  client.setQueryData(authUserQuery.queryKey, { id: 'user' } as User);
  client.setQueryData([MOVE_TREE_QUERY_KEY, 'user', MOVE_TREE_ID], moveTree);
  render(
    <QueryClientProvider client={client}>
      <MoveTreeDetails moveTreeId={MOVE_TREE_ID} />
    </QueryClientProvider>,
  );
}

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
  renderWith({ name: 'Main line', side: 'white' });

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
    renderWith({ name: 'Main line', side });

    // Then the board shows the start position with that side at the bottom
    expect(await cornerSquares()).toEqual(corners);
  },
);

it('takes no moves on the board', async () => {
  // Given a move tree
  // When its details render
  renderWith({ name: 'Main line', side: 'white' });

  // Then the board isn't interactive
  expect((await board()).closest('.board')).not.toHaveClass(
    'board-interactive',
  );
});
