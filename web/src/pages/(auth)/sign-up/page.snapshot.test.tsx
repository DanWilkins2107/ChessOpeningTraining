import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { SignUp } from './page';
import { withQueryClient } from '../../../tests-shared/withQueryClient';

describe('SignUp', () => {
  it('matches snapshot', () => {
    const { container } = render(
      withQueryClient(
        <MemoryRouter>
          <SignUp />
        </MemoryRouter>,
      ),
    );
    expect(container).toMatchSnapshot();
  });
});
