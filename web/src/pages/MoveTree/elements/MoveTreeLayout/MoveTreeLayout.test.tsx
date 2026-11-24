import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { MoveTreeLayout } from './MoveTreeLayout';

it('shows a placeholder board when given no board', () => {
  // Given the move tree layout without a board
  // When it renders
  render(<MoveTreeLayout>Panel</MoveTreeLayout>);

  // Then it shows the loading board beside the panel
  expect(
    screen.getByRole('status', { name: 'Loading board' }),
  ).toBeInTheDocument();
  expect(screen.getByText('Panel')).toBeInTheDocument();
});

it('shows the board it is given', () => {
  // Given the move tree layout with a board
  // When it renders
  render(<MoveTreeLayout board={<p>The board</p>}>Panel</MoveTreeLayout>);

  // Then it shows that board, not the placeholder
  expect(screen.getByText('The board')).toBeInTheDocument();
  expect(
    screen.queryByRole('status', { name: 'Loading board' }),
  ).not.toBeInTheDocument();
});
