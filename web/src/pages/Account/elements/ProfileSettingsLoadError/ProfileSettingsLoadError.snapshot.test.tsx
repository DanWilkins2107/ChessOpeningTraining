import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProfileSettingsLoadError } from './ProfileSettingsLoadError';

describe('ProfileSettingsLoadError', () => {
  it('matches snapshot', () => {
    const { container } = render(<ProfileSettingsLoadError />);
    expect(container).toMatchSnapshot();
  });
});
