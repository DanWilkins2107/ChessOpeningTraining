import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SettingRow } from './SettingRow';

describe('SettingRow', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <SettingRow setting="show_move_hints">
        <input type="checkbox" />
      </SettingRow>,
    );
    expect(container).toMatchSnapshot();
  });
});
