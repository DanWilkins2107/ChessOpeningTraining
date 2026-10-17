import { act, render } from '@testing-library/react';
import { Suspense } from 'react';
import { describe, expect, it } from 'vitest';
import type { MoveTreeResponse } from '../MoveTreeResponse/MoveTreeResponse';
import { LoadedMoveTree } from './LoadedMoveTree';

describe('LoadedMoveTree', () => {
  it('matches snapshot', async () => {
    const response: MoveTreeResponse = {
      success: true,
      data: { name: 'Main line', side: 'white' },
      error: null,
      count: null,
      status: 200,
      statusText: 'OK',
    };
    const { container } = await act(() =>
      render(
        <Suspense>
          <LoadedMoveTree moveTree={Promise.resolve(response)} />
        </Suspense>,
      ),
    );
    expect(container).toMatchSnapshot();
  });
});
