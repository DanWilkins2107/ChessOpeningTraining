import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { RepertoireCard } from './RepertoireCard';

it('shows its contents', () => {
  // Given a card holding a folder name
  render(<RepertoireCard>Najdorf</RepertoireCard>);

  // When the card renders

  // Then the folder name shows
  expect(screen.getByText('Najdorf')).toBeInTheDocument();
});
