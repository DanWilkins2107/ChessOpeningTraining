import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RepertoireLoading } from './RepertoireLoading';

describe('RepertoireLoading', () => {
  it('matches snapshot', () => {
    const { container } = render(<RepertoireLoading />);
    expect(container).toMatchSnapshot();
  });
});
