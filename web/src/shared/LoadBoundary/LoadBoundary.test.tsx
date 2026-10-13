import { QueryClientProvider, useSuspenseQuery } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { createQueryClient } from '../../elements/createQueryClient/createQueryClient';
import { LoadBoundary } from './LoadBoundary';

const LOADING = 'Loading things';
const ERROR = "Couldn't load things";

function Things({ load }: { load: () => Promise<string> }) {
  const { data } = useSuspenseQuery({ queryKey: ['things'], queryFn: load });
  return <p>{data}</p>;
}

const renderBoundary = (load: () => Promise<string>) =>
  render(
    <QueryClientProvider client={createQueryClient()}>
      <LoadBoundary label={LOADING} error={ERROR}>
        <Things load={load} />
      </LoadBoundary>
    </QueryClientProvider>,
  );

const failingOnce = (things: string) => {
  let calls = 0;
  return async () => {
    calls += 1;
    if (calls === 1) throw new Error('Server down');
    return things;
  };
};

it('shows the spinner while its content loads', () => {
  // Given content that never arrives

  // When the boundary renders it
  renderBoundary(() => new Promise(() => {}));

  // Then the spinner names what is loading
  expect(screen.getByRole('status', { name: LOADING })).toBeInTheDocument();
});

it('shows its content once loaded', async () => {
  // Given content that arrives
  const things = crypto.randomUUID();

  // When the boundary renders it
  renderBoundary(async () => things);

  // Then the content shows
  expect(await screen.findByText(things)).toBeInTheDocument();
});

it('shows the error when its content fails to load', async () => {
  // Given content that fails to load

  // When the boundary renders it
  renderBoundary(failingOnce(crypto.randomUUID()));

  // Then it shows the error
  expect(await screen.findByRole('alert')).toHaveTextContent(ERROR);
});

it('loads its content again on Try again', async () => {
  // Given content that failed to load once
  const things = crypto.randomUUID();
  renderBoundary(failingOnce(things));

  // When the user tries again
  fireEvent.click(await screen.findByRole('button', { name: 'Try again' }));

  // Then the content shows
  expect(await screen.findByText(things)).toBeInTheDocument();
});
