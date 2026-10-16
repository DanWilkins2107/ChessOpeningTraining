import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AnimatePiecesSetting } from './AnimatePiecesSetting';

describe('AnimatePiecesSetting', () => {
  it('matches snapshot', () => {
    const { container } = render(<AnimatePiecesSetting />);
    expect(container).toMatchSnapshot();
  });
});
