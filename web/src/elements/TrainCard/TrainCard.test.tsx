import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import { TrainCard } from './TrainCard';

it.each([
  [null, 'Not trained yet'],
  [0, 'Last trained today'],
  [1, 'Last trained yesterday'],
  [5, 'Last trained 5 days ago'],
])('describes %s days since training as "%s"', (days, text) => {
  // Given a card for a user last trained that many days ago
  render(<TrainCard daysSinceLastTrained={days} movesTrainedToday={0} />, {
    wrapper: MemoryRouter,
  });

  // Then it says when they last trained in words
  expect(screen.getByText(text)).toBeInTheDocument();
});

it.each([
  [0, '0 moves trained today'],
  [1, '1 move trained today'],
  [7, '7 moves trained today'],
])('counts %s moves trained today as "%s"', (moves, text) => {
  // Given a card with that many moves trained today
  render(<TrainCard daysSinceLastTrained={0} movesTrainedToday={moves} />, {
    wrapper: MemoryRouter,
  });

  // Then the count reads naturally, singular for one
  expect(screen.getByText(text)).toBeInTheDocument();
});

it('links its button to the train page', () => {
  // Given a card
  render(<TrainCard daysSinceLastTrained={null} movesTrainedToday={0} />, {
    wrapper: MemoryRouter,
  });

  // Then its action links to the train page
  expect(screen.getByRole('link', { name: 'Start training' })).toHaveAttribute(
    'href',
    '/train',
  );
});
