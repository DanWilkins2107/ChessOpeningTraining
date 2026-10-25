import { QueryClientProvider, useSuspenseQuery } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { createQueryClient } from '../../elements/createQueryClient/createQueryClient';
import { LoadBoundary } from './LoadBoundary';
import {
  ERROR,
  LOADING,
  LoadError,
  Loading,
} from '../../tests-shared/loadStates';

function Things({ load }: { load: () => Promise<string> }) {
  const { data } = useSuspenseQuery({ queryKey: ['things'], queryFn: load });
  return <p>{data}</p>;
}

const renderBoundary = (
  load: () => Promise<string>,
  loading: typeof Loading | null = Loading,
) =>
  render(
    <QueryClientProvider client={createQueryClient()}>
      <LoadBoundary Loading={loading} LoadError={LoadError}>
        <Things load={load} />
      </LoadBoundary>
    </QueryClientProvider>,
  );

it('shows the loading component while its content loads', () => {
  // Given content that never arrives

  // When the boundary renders it
  renderBoundary(() => new Promise(() => {}));

  // Then the loading component shows
  expect(screen.getByText(LOADING)).toBeInTheDocument();
});

it('shows nothing while its content loads when given no loading component', () => {
  // Given content that never arrives

  // When a boundary with no loading component renders it
  const { container } = renderBoundary(() => new Promise(() => {}), null);

  // Then nothing shows
  expect(container).toBeEmptyDOMElement();
});

it('shows its content once loaded', async () => {
  // Given content that arrives
  const things = crypto.randomUUID();

  // When the boundary renders it
  renderBoundary(async () => things);

  // Then the content shows
  expect(await screen.findByText(things)).toBeInTheDocument();
});

it('shows the error component when its content fails to load', async () => {
  // Given content that fails to load
  const failing = async (): Promise<string> => {
    throw new Error('Server down');
  };

  // When the boundary renders it
  renderBoundary(failing);

  // Then the error component shows
  expect(await screen.findByText(ERROR)).toBeInTheDocument();
});
