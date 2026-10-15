import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { LoadBoundary } from './LoadBoundary';

function Broken(): ReactNode {
  throw new Error('Server down');
}

function Loading() {
  return <p>Loading things</p>;
}

function LoadError() {
  return <p>Couldn't load things</p>;
}

describe('LoadBoundary', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <LoadBoundary Loading={Loading} LoadError={LoadError}>
        <p>Things</p>
      </LoadBoundary>,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot when its content fails to load', () => {
    const { container } = render(
      <LoadBoundary Loading={Loading} LoadError={LoadError}>
        <Broken />
      </LoadBoundary>,
    );
    expect(container).toMatchSnapshot();
  });
});
