import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Theme } from './page';

describe('Theme', () => {
  it('matches snapshot', () => {
    const { container } = render(<Theme />);
    expect(container).toMatchSnapshot();
  });
});
