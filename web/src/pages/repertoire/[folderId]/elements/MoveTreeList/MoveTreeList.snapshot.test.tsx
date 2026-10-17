import { act, render } from '@testing-library/react';
import { Suspense } from 'react';
import { describe, expect, it } from 'vitest';
import type { MoveTree } from '../MoveTree/MoveTree';
import type { FolderResponse } from '../FolderResponse/FolderResponse';
import { MoveTreeList } from './MoveTreeList';

const respond = (moveTrees: MoveTree[]): FolderResponse => ({
  success: true,
  data: { name: 'London', move_trees: moveTrees },
  error: null,
  count: null,
  status: 200,
  statusText: 'OK',
});

describe('MoveTreeList', () => {
  it.each([
    [
      'move trees',
      [{ id: '7c3e1d2a-5b4f-4e6a-9c8d-1f2e3a4b5c6d', name: 'Main line' }],
    ],
    ['no move trees', []],
  ])('matches snapshot with %s', async (_, moveTrees) => {
    const { container } = await act(() =>
      render(
        <Suspense>
          <MoveTreeList
            folderId="7c3e1d2a-5b4f-4e6a-9c8d-1f2e3a4b5c6d"
            folder={Promise.resolve(respond(moveTrees))}
            onCreated={() => {}}
          />
        </Suspense>,
      ),
    );
    expect(container).toMatchSnapshot();
  });
});
