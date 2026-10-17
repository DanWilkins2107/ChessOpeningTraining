import { PostgrestError } from '@supabase/supabase-js';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import type { RepertoireResponse } from '../RepertoireResponse/RepertoireResponse';
import { RepertoireList } from './RepertoireList';

const ok = <T,>(data: T[]) => ({
  success: true as const,
  data,
  error: null,
  count: null,
  status: 200,
  statusText: 'OK',
});

const failed = {
  success: false as const,
  data: null,
  error: new PostgrestError({
    message: 'permission denied',
    details: '',
    hint: '',
    code: '42501',
  }),
  count: null,
  status: 403,
  statusText: 'Forbidden',
};

const renderList = (response: RepertoireResponse) =>
  render(<RepertoireList response={response} />, { wrapper: MemoryRouter });

it("links each folder, named by the folder, to that folder's page", () => {
  // Given two folders
  const folders = [
    { id: 'a4f1', name: 'London' },
    { id: 'b7c2', name: 'Caro-Kann' },
  ];

  // When the list renders
  renderList({ folders: ok(folders), moveTrees: ok([]) });

  // Then each row links to its own folder page, named by the folder alone
  expect(screen.getByRole('link', { name: 'London' })).toHaveAttribute(
    'href',
    '/repertoire/a4f1',
  );
  expect(screen.getByRole('link', { name: 'Caro-Kann' })).toHaveAttribute(
    'href',
    '/repertoire/b7c2',
  );
});

it('lists folders first, then move trees with their side', () => {
  // Given a folder and two move trees, one per side
  const folders = [{ id: 'a4f1', name: 'London' }];
  const moveTrees = [
    { id: 'c3d4', name: 'Scotch', side: 'white' as const },
    { id: 'e5f6', name: 'Sicilian', side: 'black' as const },
  ];

  // When the list renders
  renderList({ folders: ok(folders), moveTrees: ok(moveTrees) });

  // Then the folder comes first, and each move tree shows its side
  const rows = screen.getAllByRole('listitem');
  expect(rows.map((row) => row.textContent)).toEqual([
    'London',
    'Scotchwhite',
    'Sicilianblack',
  ]);
  expect(within(rows[1]).queryByRole('link')).not.toBeInTheDocument();
});

it('shows the empty state only when there are neither folders nor move trees', () => {
  // Given a move tree and no folders
  const moveTrees = [{ id: 'c3d4', name: 'Scotch', side: 'white' as const }];

  // When the list renders
  renderList({ folders: ok([]), moveTrees: ok(moveTrees) });

  // Then it lists the move tree, not the empty state
  expect(screen.getByText('Scotch')).toBeInTheDocument();
  expect(
    screen.queryByText('No folders or move trees yet'),
  ).not.toBeInTheDocument();
});

it('shows a generic message when move trees fail to load', () => {
  // Given folders that loaded and move trees that failed
  const folders = [{ id: 'a4f1', name: 'London' }];

  // When the list renders
  renderList({ folders: ok(folders), moveTrees: failed });

  // Then it shows the message in place of the list
  expect(screen.getByRole('alert')).toHaveTextContent(
    "Couldn't load your repertoire, try again",
  );
  expect(screen.queryByText('London')).not.toBeInTheDocument();
});
