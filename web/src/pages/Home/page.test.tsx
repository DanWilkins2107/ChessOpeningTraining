import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Home } from './page';

test('renders the app heading', () => {
  render(<Home />);

  expect(
    screen.getByRole('heading', { name: 'Chess Opening Training' }),
  ).toBeInTheDocument();
});
