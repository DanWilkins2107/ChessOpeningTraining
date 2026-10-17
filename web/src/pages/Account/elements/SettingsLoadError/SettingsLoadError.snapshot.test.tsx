import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SettingsLoadError } from './SettingsLoadError';

describe('SettingsLoadError', () => {
  it('matches snapshot', () => {
    const { container } = render(<SettingsLoadError />);
    expect(container).toMatchSnapshot();
  });
});
