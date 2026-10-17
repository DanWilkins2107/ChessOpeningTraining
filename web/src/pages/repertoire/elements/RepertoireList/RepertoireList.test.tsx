import { PostgrestError } from '@supabase/supabase-js';
import { fireEvent, render, screen } from '@testing-library/react';
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
  render(<RepertoireList response={response} />);

const visibleRows = () =>
  screen.getAllByRole('listitem').map((row) => row.textContent);

it('lists folders first, collapsed, then top-level move trees with their side', () => {
  // Given a folder, a move tree in it, and two top-level move trees
  const folders = [{ id: 'a4f1', name: 'London' }];
  const moveTrees = [
    { id: 'c3d4', name: 'Scotch', side: 'white' as const, folder_id: null },
    { id: 'b1a2', name: 'Jobava', side: 'white' as const, folder_id: 'a4f1' },
    { id: 'e5f6', name: 'Sicilian', side: 'black' as const, folder_id: null },
  ];

  // When the list renders
  renderList({ folders: ok(folders), moveTrees: ok(moveTrees) });

  // Then the folder comes first with its move tree hidden, then each
  // top-level move tree
  expect(visibleRows()).toEqual([
    'LondonJobavawhite',
    'Scotchwhite',
    'Sicilianblack',
  ]);
  expect(screen.getByText('Jobava')).not.toBeVisible();
});

it('expands a folder to show only its own move trees', () => {
  // Given two folders, each with a move tree
  const folders = [
    { id: 'a4f1', name: 'London' },
    { id: 'b7c2', name: 'Caro-Kann' },
  ];
  const moveTrees = [
    { id: 'b1a2', name: 'Jobava', side: 'white' as const, folder_id: 'a4f1' },
    { id: 'd9e8', name: 'Advance', side: 'black' as const, folder_id: 'b7c2' },
  ];
  renderList({ folders: ok(folders), moveTrees: ok(moveTrees) });

  // When the first folder is expanded
  fireEvent.click(screen.getByRole('button', { name: 'London' }));

  // Then its move tree shows beneath it, and the other folder stays shut
  expect(visibleRows()).toEqual([
    'LondonJobavawhite',
    'Jobavawhite',
    'Caro-KannAdvanceblack',
  ]);
  expect(screen.getByText('Jobava')).toBeVisible();
  expect(screen.getByText('Advance')).not.toBeVisible();
});

it('shows the empty state only when there are neither folders nor move trees', () => {
  // Given a move tree and no folders
  const moveTrees = [
    { id: 'c3d4', name: 'Scotch', side: 'white' as const, folder_id: null },
  ];

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
