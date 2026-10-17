import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import { DailyTestCard } from './DailyTestCard';

it('offers to start a test not yet started', () => {
  // Given today's test is not started
  render(<DailyTestCard status="not-started" />, { wrapper: MemoryRouter });

  // When the card renders

  // Then it says so and links to the daily test
  expect(screen.getByText('Not started')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Start test' })).toHaveAttribute(
    'href',
    '/daily-test',
  );
});

it('offers to resume a test in progress', () => {
  // Given today's test is part done
  render(<DailyTestCard status="in-progress" />, { wrapper: MemoryRouter });

  // When the card renders

  // Then it says so and links to the daily test
  expect(screen.getByText('In progress')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Resume test' })).toHaveAttribute(
    'href',
    '/daily-test',
  );
});

it('shows the score of a finished test', () => {
  // Given today's test is done with a score of 80
  render(<DailyTestCard status="done" score={80} />, { wrapper: MemoryRouter });

  // When the card renders

  // Then it shows the score and links to the result
  expect(screen.getByText('Done · 80%')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'View result' })).toHaveAttribute(
    'href',
    '/daily-test',
  );
});
