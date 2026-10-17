import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { withLoadedSettings } from '../../tests-shared/profiles';
import { SettingToggle } from './SettingToggle';

describe('SettingToggle', () => {
  it('matches snapshot', () => {
    const { container } = render(
      withLoadedSettings(<SettingToggle setting="show_move_hints" />, {
        animate_pieces: true,
        show_move_hints: false,
      }),
    );
    expect(container).toMatchSnapshot();
  });
});
