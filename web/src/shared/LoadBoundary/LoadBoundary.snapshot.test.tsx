import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoadBoundary } from './LoadBoundary';
import { Broken, LoadError, Loading } from '../../tests-shared/loadStates';

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
