import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { SetNewPassword } from './page';
import { withQueryClient } from '../../tests-shared/withQueryClient';

describe('SetNewPassword', () => {
  it('matches snapshot', () => {
    const { container } = render(
      withQueryClient(
        <MemoryRouter>
          <SetNewPassword />
        </MemoryRouter>,
      ),
    );
    expect(container).toMatchSnapshot();
  });
});
