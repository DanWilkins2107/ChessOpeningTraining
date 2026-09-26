import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SidePicker } from './SidePicker';

describe('SidePicker', () => {
  it('matches snapshot', () => {
    const { container } = render(<SidePicker />);
    expect(container).toMatchSnapshot();
  });
});
