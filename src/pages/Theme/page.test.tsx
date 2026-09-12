import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Theme } from './page';

test('names every token it shows a specimen for', () => {
  render(<Theme />);

  expect(
    screen.getByRole('heading', { level: 1, name: 'Design tokens' }),
  ).toBeInTheDocument();
  expect(screen.getByText('--accent')).toBeInTheDocument();
  expect(screen.getByText('--radius-pill')).toBeInTheDocument();
  expect(screen.getByText('--gap-lg')).toBeInTheDocument();
});
