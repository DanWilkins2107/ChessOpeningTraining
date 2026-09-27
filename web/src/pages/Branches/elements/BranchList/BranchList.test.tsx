import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import { BranchList } from './BranchList';

it("links each branch, named by the branch, to that branch's page", () => {
  // Given two branches
  const data = [
    { id: 'a4f1', name: 'London', side: 'white' as const },
    { id: 'b7c2', name: 'Caro-Kann', side: 'black' as const },
  ];

  // When the list renders
  render(
    <BranchList
      response={{
        success: true,
        data,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK',
      }}
    />,
    { wrapper: MemoryRouter },
  );

  // Then each row links to its own branch page, named by the branch alone
  expect(screen.getByRole('link', { name: 'London' })).toHaveAttribute(
    'href',
    '/branches/a4f1',
  );
  expect(screen.getByRole('link', { name: 'Caro-Kann' })).toHaveAttribute(
    'href',
    '/branches/b7c2',
  );
});
