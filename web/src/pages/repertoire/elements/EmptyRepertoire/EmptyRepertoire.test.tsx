import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { EmptyRepertoire } from './EmptyRepertoire';

it('asks to create a folder when the button is pressed', () => {
  // Given the empty state
  const onCreateFolder = vi.fn();
  render(<EmptyRepertoire onCreateFolder={onCreateFolder} />);

  // When the user presses Create folder
  fireEvent.click(screen.getByRole('button', { name: 'Create folder' }));

  // Then it asks for a new folder
  expect(onCreateFolder).toHaveBeenCalledOnce();
});

it('says there is nothing here yet, without exposing its decorative tiles', () => {
  // Given the empty state
  render(<EmptyRepertoire onCreateFolder={() => {}} />);

  // When it renders

  // Then the heading shows and the pawn is hidden from assistive tech
  expect(
    screen.getByRole('heading', { name: 'Nothing here yet' }),
  ).toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});
