import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SettingSwitchLoadError } from './SettingSwitchLoadError';

describe('SettingSwitchLoadError', () => {
  it('matches snapshot', () => {
    const { container } = render(<SettingSwitchLoadError />);
    expect(container).toMatchSnapshot();
  });
});
