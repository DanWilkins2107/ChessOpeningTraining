import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { SignIn } from './page';
import { withQueryClient } from '../../tests-shared/withQueryClient';

describe('SignIn', () => {
  it('matches snapshot', () => {
    const { container } = render(
      withQueryClient(
        <MemoryRouter>
          <SignIn />
        </MemoryRouter>,
      ),
    );
    expect(container).toMatchSnapshot();
  });
});
