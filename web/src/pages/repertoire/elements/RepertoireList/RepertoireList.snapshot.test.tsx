import { render } from '@testing-library/react';
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
              { id: 'b1a2', name: 'Jobava', side: 'white', folder_id: 'a4f1' },
              { id: 'c3d4', name: 'Scotch', side: 'white', folder_id: null },
              { id: 'e5f6', name: 'Sicilian', side: 'black', folder_id: null },
            ],
            error: null,
            count: null,
            status: 200,
            statusText: 'OK',
          },
        }}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
