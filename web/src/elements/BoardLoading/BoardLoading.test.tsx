import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { BoardLoading } from './BoardLoading';

it('says the board is loading', () => {
  // Given nothing to draw yet

  // When the loading board renders
  render(<BoardLoading />);

  // Then it announces that the board is on its way
  expect(
    screen.getByRole('status', { name: 'Loading board' }),
  ).toBeInTheDocument();
});
