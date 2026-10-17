import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { RepertoireList } from './RepertoireList';

describe('RepertoireList', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <RepertoireList
        response={{
          folders: {
            success: true,
            data: [{ id: 'a4f1', name: 'London' }],
            error: null,
            count: null,
            status: 200,
            statusText: 'OK',
          },
          moveTrees: {
            success: true,
            data: [
              { id: 'c3d4', name: 'Scotch', side: 'white' },
              { id: 'e5f6', name: 'Sicilian', side: 'black' },
            ],
            error: null,
            count: null,
            status: 200,
            statusText: 'OK',
          },
        }}
      />,
      { wrapper: MemoryRouter },
    );
    expect(container).toMatchSnapshot();
  });
});
