import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AnimatePiecesRow } from './AnimatePiecesRow';

describe('AnimatePiecesRow', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <AnimatePiecesRow>
        <input type="checkbox" />
      </AnimatePiecesRow>,
    );
    expect(container).toMatchSnapshot();
  });
});
