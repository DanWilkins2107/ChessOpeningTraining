import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AnimatePiecesLoading } from './AnimatePiecesLoading';

describe('AnimatePiecesLoading', () => {
  it('matches snapshot', () => {
    const { container } = render(<AnimatePiecesLoading />);
    expect(container).toMatchSnapshot();
  });
});
