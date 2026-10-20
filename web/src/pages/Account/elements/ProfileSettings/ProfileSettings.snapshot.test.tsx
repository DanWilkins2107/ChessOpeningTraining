import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { withLoadedSettings } from '../../tests-shared/profiles';
import { ProfileSettings } from './ProfileSettings';

describe('ProfileSettings', () => {
  it('matches snapshot', () => {
    const { container } = render(
      withLoadedSettings(<ProfileSettings />, {
        animate_pieces: true,
        show_move_hints: false,
      }),
    );
    expect(container).toMatchSnapshot();
  });
});
