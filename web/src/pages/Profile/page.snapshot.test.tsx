import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Profile } from './page';

describe('Profile', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });
});
