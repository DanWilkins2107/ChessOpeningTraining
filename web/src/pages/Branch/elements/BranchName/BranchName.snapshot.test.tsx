import { act, render } from '@testing-library/react';
import { Suspense } from 'react';
import { describe, expect, it } from 'vitest';
import type { BranchResponse } from '../BranchResponse/BranchResponse';
import { BranchName } from './BranchName';

describe('BranchName', () => {
  it('matches snapshot', async () => {
    const response: BranchResponse = {
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
          <BranchName branch={Promise.resolve(response)} />
        </Suspense>,
      ),
    );
    expect(container).toMatchSnapshot();
  });
});
