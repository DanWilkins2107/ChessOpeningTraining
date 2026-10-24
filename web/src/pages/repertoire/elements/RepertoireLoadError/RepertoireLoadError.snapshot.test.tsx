import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RepertoireLoadError } from './RepertoireLoadError';

describe('RepertoireLoadError', () => {
  it('matches snapshot', () => {
    const { container } = render(<RepertoireLoadError retry={() => {}} />);
    expect(container).toMatchSnapshot();
  });
});
