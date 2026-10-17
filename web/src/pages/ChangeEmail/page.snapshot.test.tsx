import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ChangeEmail } from './page';
import { withQueryClient } from '../../tests-shared/withQueryClient';

describe('ChangeEmail', () => {
  it('matches snapshot', () => {
    const { container } = render(
      withQueryClient(
        <MemoryRouter>
          <ChangeEmail />
        </MemoryRouter>,
      ),
    );
    expect(container).toMatchSnapshot();
  });
});
