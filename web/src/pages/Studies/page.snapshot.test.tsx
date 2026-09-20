import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Studies } from './page';

describe('Studies', () => {
  it('matches snapshot', () => {
    const { container } = render(<Studies />);
    expect(container).toMatchSnapshot();
  });
});
