import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SettingsLoading } from './SettingsLoading';

describe('SettingsLoading', () => {
  it('matches snapshot', () => {
    const { container } = render(<SettingsLoading />);
    expect(container).toMatchSnapshot();
  });
});
