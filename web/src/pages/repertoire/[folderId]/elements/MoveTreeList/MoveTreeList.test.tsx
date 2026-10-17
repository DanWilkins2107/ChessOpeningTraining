import { act, render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import { MoveTreeList } from './MoveTreeList';

it("links each move tree, named by the move tree, to that move tree's page", async () => {
  // Given a folder with two move trees
  const moveTrees = [
    { id: 'a4f1', name: 'Main line' },
    { id: 'b7c2', name: 'Alternatives' },
  ];

  // When the list renders
  await act(() =>
    render(
      <MemoryRouter>
        <Suspense>
          <MoveTreeList
            folder={Promise.resolve({
              success: true,
              data: { name: 'London', move_trees: moveTrees },
              error: null,
              count: null,
              status: 200,
              statusText: 'OK',
            })}
          />
        </Suspense>
      </MemoryRouter>,
    ),
  );

  // Then each row links to its own move tree page, named by the move tree alone
  expect(screen.getByRole('link', { name: 'Main line' })).toHaveAttribute(
    'href',
    '/tree/a4f1',
  );
  expect(screen.getByRole('link', { name: 'Alternatives' })).toHaveAttribute(
    'href',
    '/tree/b7c2',
  );
});
