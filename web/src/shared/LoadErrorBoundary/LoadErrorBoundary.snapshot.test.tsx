import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { LoadErrorBoundary } from './LoadErrorBoundary';
import { LoadError } from '../../tests-shared/loadStates';

function Broken(): ReactNode {
  throw new Error('Server down');
}

describe('LoadErrorBoundary', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <LoadErrorBoundary LoadError={LoadError}>
        <p>Things</p>
      </LoadErrorBoundary>,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot when its content fails to load', () => {
    const { container } = render(
      <LoadErrorBoundary LoadError={LoadError}>
        <Broken />
      </LoadErrorBoundary>,
    );
    expect(container).toMatchSnapshot();
  });
});
