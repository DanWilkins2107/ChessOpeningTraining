import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SettingSwitchLoading } from './SettingSwitchLoading';

describe('SettingSwitchLoading', () => {
  it('matches snapshot', () => {
    const { container } = render(<SettingSwitchLoading />);
    expect(container).toMatchSnapshot();
  });
});
