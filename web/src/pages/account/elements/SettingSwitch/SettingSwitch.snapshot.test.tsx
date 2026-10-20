import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { withLoadedSettings } from '../../tests-shared/profiles';
import { SettingSwitch } from './SettingSwitch';

describe('SettingSwitch', () => {
  it('matches snapshot', () => {
    const { container } = render(
      withLoadedSettings(
        <SettingSwitch
          setting="show_move_hints"
          chosen={undefined}
          choose={() => {}}
        />,
        { animate_pieces: true, show_move_hints: false },
      ),
    );
    expect(container).toMatchSnapshot();
  });
});
