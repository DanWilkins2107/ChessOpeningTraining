import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Account } from './page';
import { withLoadedSettings } from './tests-shared/profiles';

describe('Account', () => {
  it('matches snapshot', () => {
    const { container } = render(
      withLoadedSettings(
        <MemoryRouter>
          <Account />
        </MemoryRouter>,
        { animate_pieces: true, show_move_hints: false },
      ),
    );
    expect(container).toMatchSnapshot();
  });
});
