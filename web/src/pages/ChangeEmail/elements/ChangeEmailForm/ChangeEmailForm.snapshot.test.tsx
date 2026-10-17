import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ChangeEmailForm } from './ChangeEmailForm';
import { withQueryClient } from '../../../../tests-shared/withQueryClient';

describe('ChangeEmailForm', () => {
  it('matches snapshot', () => {
    const { container } = render(
      withQueryClient(
        <MemoryRouter>
          <ChangeEmailForm />
        </MemoryRouter>,
      ),
    );
    expect(container).toMatchSnapshot();
  });
});
