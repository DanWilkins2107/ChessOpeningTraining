import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { FolderList } from './FolderList';

describe('FolderList', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <FolderList
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
