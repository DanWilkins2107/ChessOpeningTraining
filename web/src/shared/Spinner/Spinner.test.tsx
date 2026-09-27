import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Spinner } from './Spinner';

it('announces what is loading', () => {
  // Given a label for what is on its way

  // When the spinner renders
  render(<Spinner label="Loading things" />);

  // Then it is a status named by that label
  expect(
    screen.getByRole('status', { name: 'Loading things' }),
  ).toBeInTheDocument();
});
