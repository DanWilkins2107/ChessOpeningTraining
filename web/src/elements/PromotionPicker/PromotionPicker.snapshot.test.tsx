import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PromotionPicker } from './PromotionPicker';
import { FILES } from '../files/files.constants';

describe('PromotionPicker', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <PromotionPicker
        files={FILES}
        ranks={[8, 7, 6, 5, 4, 3, 2, 1]}
        square="a8"
        color="w"
        onPick={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
