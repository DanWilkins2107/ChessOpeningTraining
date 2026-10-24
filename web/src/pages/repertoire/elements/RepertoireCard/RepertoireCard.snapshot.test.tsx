import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RepertoireCard } from './RepertoireCard';

describe('RepertoireCard', () => {
  it('matches snapshot', () => {
    const { container } = render(<RepertoireCard>Contents</RepertoireCard>);
    expect(container).toMatchSnapshot();
  });
});
