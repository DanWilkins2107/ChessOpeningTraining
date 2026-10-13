import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { LoadBoundary } from './LoadBoundary';

function Broken(): ReactNode {
  throw new Error('Server down');
}

describe('LoadBoundary', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <LoadBoundary label="Loading things" error="Couldn't load things">
        <p>Things</p>
      </LoadBoundary>,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot when its content fails to load', () => {
    const { container } = render(
      <LoadBoundary label="Loading things" error="Couldn't load things">
        <Broken />
      </LoadBoundary>,
    );
    expect(container).toMatchSnapshot();
  });
});
