import { act, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Board } from './Board';

const LONE_WHITE_KING = '8/8/8/8/8/8/8/4K3 w - - 0 1';

const loadingBoard = () =>
  screen.queryByRole('status', { name: 'Loading board' });

const chessBoard = () => screen.queryByRole('grid', { name: 'Chess board' });

const renderBoard = (position: Promise<string>) =>
  render(
    <Board
      position={position}
      orientation="white"
      animatePieces={false}
      showMoveHints={false}
    />,
  );

it('shows the loading board while the position is on its way', () => {
  // Given a position that has not arrived
  const position = new Promise<string>(() => {});

  // When the board renders
  renderBoard(position);

  // Then it shows the loading board
  expect(loadingBoard()).toBeInTheDocument();
  expect(chessBoard()).not.toBeInTheDocument();
});

it('draws the position once it arrives', async () => {
  // Given a position, already arrived
  const position = Promise.resolve(LONE_WHITE_KING);

  // When the board renders
  await act(async () => {
    renderBoard(position);
  });

  // Then it swaps the loading board for the position
  expect(chessBoard()).toBeInTheDocument();
  expect(loadingBoard()).not.toBeInTheDocument();
  expect(
    screen.getByRole('gridcell', { name: 'e1, white king' }),
  ).toBeInTheDocument();
});

it('stays loading when the position fails', async () => {
  // Given a position that fails
  const position = Promise.reject(new Error('moves fetch failed'));

  // When the board renders and the failure lands
  await act(async () => {
    renderBoard(position);
  });

  // Then it keeps showing the loading board, with no error of its own
  expect(loadingBoard()).toBeInTheDocument();
  expect(chessBoard()).not.toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
