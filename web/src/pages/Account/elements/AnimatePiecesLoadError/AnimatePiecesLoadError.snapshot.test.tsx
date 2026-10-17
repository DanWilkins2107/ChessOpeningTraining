import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AnimatePiecesLoadError } from './AnimatePiecesLoadError';

describe('AnimatePiecesLoadError', () => {
  it('matches snapshot', () => {
    const { container } = render(<AnimatePiecesLoadError />);
    expect(container).toMatchSnapshot();
  });
});
