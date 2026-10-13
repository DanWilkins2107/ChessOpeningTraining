import { act, render } from '@testing-library/react';
import { Suspense } from 'react';
import { describe, expect, it } from 'vitest';
import type { FolderResponse } from '../FolderResponse/FolderResponse';
import { FolderName } from './FolderName';

describe('FolderName', () => {
  it('matches snapshot', async () => {
    const response: FolderResponse = {
      success: true,
      data: { name: 'London', chapters: [] },
      error: null,
      count: null,
      status: 200,
      statusText: 'OK',
    };
    const { container } = await act(() =>
      render(
        <Suspense>
          <FolderName folder={Promise.resolve(response)} />
        </Suspense>,
      ),
    );
    expect(container).toMatchSnapshot();
  });
});
