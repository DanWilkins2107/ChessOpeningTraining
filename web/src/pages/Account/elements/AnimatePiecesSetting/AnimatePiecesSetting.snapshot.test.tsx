import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { withQueryClient } from '../../../../tests-shared/withQueryClient';
import { AnimatePiecesSetting } from './AnimatePiecesSetting';

describe('AnimatePiecesSetting', () => {
  it('matches snapshot', () => {
    const { container } = render(withQueryClient(<AnimatePiecesSetting />));
    expect(container).toMatchSnapshot();
  });
});
