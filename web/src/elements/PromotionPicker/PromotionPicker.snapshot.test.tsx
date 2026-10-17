import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PromotionPicker } from './PromotionPicker';

describe('PromotionPicker', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <PromotionPicker color="w" onPick={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(container).toMatchSnapshot();
  });
});
