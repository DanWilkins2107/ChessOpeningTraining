import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { BranchList } from './BranchList';

describe('BranchList', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <BranchList
        response={{
          success: true,
          data: [{ id: 'a4f1', name: 'London', side: 'white' }],
          error: null,
          count: null,
          status: 200,
          statusText: 'OK',
        }}
      />,
      { wrapper: MemoryRouter },
    );
    expect(container).toMatchSnapshot();
  });
});
