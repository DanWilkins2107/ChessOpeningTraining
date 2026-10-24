import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { RepertoireLoading } from './RepertoireLoading';

it('shows three placeholder rows while loading', () => {
  // Given the repertoire is loading
  render(<RepertoireLoading />);

  // When the placeholder renders

  // Then it holds three rows, each with a tile and a name
  const status = screen.getByRole('status', { name: 'Loading repertoire' });
  const rows = status.querySelectorAll('.repertoire-loading-row');
  expect(rows).toHaveLength(3);
  for (const row of rows) {
    expect(row.querySelector('.repertoire-loading-tile')).toBeInTheDocument();
    expect(row.querySelector('.repertoire-loading-name')).toBeInTheDocument();
  }
});
