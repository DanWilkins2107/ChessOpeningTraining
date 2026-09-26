import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AnimatePiecesToggle } from './AnimatePiecesToggle';

describe('AnimatePiecesToggle', () => {
  it('matches snapshot', () => {
    const { container } = render(<AnimatePiecesToggle />);
    expect(container).toMatchSnapshot();
  });
});
