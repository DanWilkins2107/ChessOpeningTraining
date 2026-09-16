import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Board } from './Board';

const EMPTY = '8/8/8/8/8/8/8/8';
const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const squareNames = () =>
  within(screen.getByRole('grid', { name: 'Chess board' }))
    .getAllByRole('row')
    .map((row) =>
      within(row)
        .getAllByRole('gridcell')
        .map((cell) => cell.getAttribute('aria-label'))
        .join(' '),
    );

const square = (name: string) => screen.getByRole('gridcell', { name });

const pieceImages = () => [
  ...document.querySelectorAll<HTMLImageElement>('.board-piece'),
];

const imageAt = (transform: string) =>
  pieceImages().find((image) => image.style.transform === transform);

const KING_ON_E1 = '8/8/8/8/8/8/8/4K3';
const KING_ON_E2 = '8/8/8/8/8/8/4K3/8';

const ROOKS_HOME = '4k3/8/8/8/8/8/4K3/R6R';
const ROOK_ON_H5 = '4k3/8/8/7R/8/8/4K3/R7';
const ROOKS_ON_THE_H_FILE = '4k3/8/8/7R/8/8/4K3/7R';

it('lays out rank 8 at the top from white', () => {
  // Given the board faces white

  // When it renders
  render(<Board position={EMPTY} orientation="white" />);

  // Then rank 8 is the top row and the a-file is on the left
  expect(squareNames()).toEqual([
    'a8 b8 c8 d8 e8 f8 g8 h8',
    'a7 b7 c7 d7 e7 f7 g7 h7',
    'a6 b6 c6 d6 e6 f6 g6 h6',
    'a5 b5 c5 d5 e5 f5 g5 h5',
    'a4 b4 c4 d4 e4 f4 g4 h4',
    'a3 b3 c3 d3 e3 f3 g3 h3',
    'a2 b2 c2 d2 e2 f2 g2 h2',
    'a1 b1 c1 d1 e1 f1 g1 h1',
  ]);
});

it('lays out rank 1 at the top from black', () => {
  // Given the board faces black

  // When it renders
  render(<Board position={EMPTY} orientation="black" />);

  // Then rank 1 is the top row and the h-file is on the left
  expect(squareNames()).toEqual([
    'h1 g1 f1 e1 d1 c1 b1 a1',
    'h2 g2 f2 e2 d2 c2 b2 a2',
    'h3 g3 f3 e3 d3 c3 b3 a3',
    'h4 g4 f4 e4 d4 c4 b4 a4',
    'h5 g5 f5 e5 d5 c5 b5 a5',
    'h6 g6 f6 e6 d6 c6 b6 a6',
    'h7 g7 f7 e7 d7 c7 b7 a7',
    'h8 g8 f8 e8 d8 c8 b8 a8',
  ]);
});

it.each(['white', 'black'] as const)(
  'colours squares the same from %s',
  (orientation) => {
    // Given the board faces either side

    // When it renders
    render(<Board position={EMPTY} orientation={orientation} />);

    // Then a1 and h8 are dark, and h1 and a8 are light
    for (const name of ['a1', 'h8']) {
      expect(square(name)).toHaveClass('board-square-dark');
    }
    for (const name of ['h1', 'a8']) {
      expect(square(name)).toHaveClass('board-square-light');
    }
  },
);

it('labels ranks on the left edge and files on the bottom edge from white', () => {
  // Given the board faces white

  // When it renders
  render(<Board position={EMPTY} orientation="white" />);

  // Then only the left column shows ranks and only the bottom row shows files
  expect(square('a8')).toHaveTextContent(/^8$/);
  expect(square('a1')).toHaveTextContent(/^1a$/);
  expect(square('h1')).toHaveTextContent(/^h$/);
  expect(square('e4')).toHaveTextContent(/^$/);
});

it('labels ranks on the left edge and files on the bottom edge from black', () => {
  // Given the board faces black

  // When it renders
  render(<Board position={EMPTY} orientation="black" />);

  // Then the h-file carries the ranks and rank 8 carries the files
  expect(square('h1')).toHaveTextContent(/^1$/);
  expect(square('h8')).toHaveTextContent(/^8h$/);
  expect(square('a8')).toHaveTextContent(/^a$/);
  expect(square('e4')).toHaveTextContent(/^$/);
});

it('keeps edge labels out of the accessibility tree', () => {
  // Given a rendered board
  render(<Board position={EMPTY} orientation="white" />);

  // When its labels are read
  const labels = square('a1').querySelectorAll('span');

  // Then each is hidden from assistive technology
  expect([...labels].map((label) => label.getAttribute('aria-hidden'))).toEqual(
    ['true', 'true'],
  );
});

it('announces the piece standing on a square', () => {
  // Given the starting position

  // When it renders
  render(<Board position={START} orientation="white" />);

  // Then e1 names the king on it
  expect(square('e1, white king')).toBeInTheDocument();
});

it('announces an empty square by name alone', () => {
  // Given the starting position

  // When it renders
  render(<Board position={START} orientation="white" />);

  // Then e4 names no piece
  expect(square('e4')).toBeInTheDocument();
});

it('shows each piece its own image', () => {
  // Given a lone white king

  // When it renders
  render(<Board position={KING_ON_E1} orientation="white" />);

  // Then the board holds the white king artwork
  expect(pieceImages()[0]).toHaveAttribute(
    'src',
    expect.stringContaining('wK'),
  );
});

it('shows one image per piece and no more', () => {
  // Given the starting position

  // When it renders
  render(<Board position={START} orientation="white" />);

  // Then the 32 men are all that is drawn
  expect(pieceImages()).toHaveLength(32);
});

it('keeps piece images out of the accessibility tree', () => {
  // Given the starting position, whose squares already announce their pieces

  // When it renders
  render(<Board position={START} orientation="white" />);

  // Then the images add nothing for a screen reader to read
  expect(screen.queryAllByRole('img')).toEqual([]);
});

it('offsets a piece to its square from white', () => {
  // Given the board faces white

  // When a king on e1 renders
  render(<Board position={KING_ON_E1} orientation="white" />);

  // Then it sits five files across and eight ranks down
  expect(pieceImages()[0].style.transform).toBe('translate(400%, 700%)');
});

it('offsets a piece to its square from black', () => {
  // Given the board faces black

  // When a king on e1 renders
  render(<Board position={KING_ON_E1} orientation="black" />);

  // Then it sits four files across and on the top rank
  expect(pieceImages()[0].style.transform).toBe('translate(300%, 0%)');
});

it('moves a piece by its offset, so it slides rather than jumps', () => {
  // Given a king on e1
  const { rerender } = render(
    <Board position={KING_ON_E1} orientation="white" />,
  );
  const before = pieceImages()[0];

  // When it steps up to e2
  rerender(<Board position={KING_ON_E2} orientation="white" />);

  // Then the same image is still on the board
  expect(pieceImages()[0]).toBe(before);
});

it('offsets a moved piece to the square it arrived on', () => {
  // Given a king on e1
  const { rerender } = render(
    <Board position={KING_ON_E1} orientation="white" />,
  );

  // When it steps up to e2
  rerender(<Board position={KING_ON_E2} orientation="white" />);

  // Then its offset is one rank higher
  expect(pieceImages()[0].style.transform).toBe('translate(400%, 600%)');
});

it('keeps a piece its own image across a run of moves', () => {
  // Given a rook on a1 and another on h1
  const { rerender } = render(
    <Board position={ROOKS_HOME} orientation="white" />,
  );
  const fromA1 = imageAt('translate(0%, 700%)');

  // When the h1 rook goes to h5 and the a1 rook then follows it onto h1
  rerender(<Board position={ROOK_ON_H5} orientation="white" />);
  rerender(<Board position={ROOKS_ON_THE_H_FILE} orientation="white" />);

  // Then h1 shows the rook that started on a1, not the one that left it
  expect(imageAt('translate(700%, 700%)')).toBe(fromA1);
});

it('announces the square a piece moved to', () => {
  // Given a king on e1
  const { rerender } = render(
    <Board position={KING_ON_E1} orientation="white" />,
  );

  // When it steps up to e2
  rerender(<Board position={KING_ON_E2} orientation="white" />);

  // Then e2 names the king standing on it
  expect(square('e2, white king')).toBeInTheDocument();
});

it('keeps pieces on their own squares from black', () => {
  // Given the starting position

  // When it renders facing black
  render(<Board position={START} orientation="black" />);

  // Then the white king is still announced on e1
  expect(square('e1, white king')).toBeInTheDocument();
});
