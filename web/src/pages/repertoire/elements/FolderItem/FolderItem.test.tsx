import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import type { RepertoireMoveTree } from '../RepertoireMoveTree/RepertoireMoveTree';
import { FolderItem } from './FolderItem';

const folder = { id: 'a4f1', name: 'London' };
const jobava: RepertoireMoveTree = {
  id: 'b1a2',
  name: 'Jobava',
  side: 'white',
  folder_id: 'a4f1',
};

const renderFolder = (moveTrees: RepertoireMoveTree[]) =>
  render(
    <ul>
      <FolderItem folder={folder} moveTrees={moveTrees} />
    </ul>,
  );

it('starts collapsed, hiding its move trees', () => {
  // Given a folder holding a move tree
  // When it renders
  renderFolder([jobava]);

  // Then the toggle says it is collapsed and the move tree is hidden
  expect(screen.getByRole('button', { name: 'London' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  expect(screen.getByText('Jobava')).not.toBeVisible();
});

it('expands on click to show its move trees, and collapses on a second click', () => {
  // Given a collapsed folder holding a move tree
  renderFolder([jobava]);
  const toggle = screen.getByRole('button', { name: 'London' });

  // When it is clicked
  fireEvent.click(toggle);

  // Then it is expanded and the move tree shows
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText('Jobava')).toBeVisible();

  // When it is clicked again
  fireEvent.click(toggle);

  // Then it collapses
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(screen.getByText('Jobava')).not.toBeVisible();
});

it('says so when expanded with nothing inside', () => {
  // Given an empty folder
  renderFolder([]);

  // When it is expanded
  fireEvent.click(screen.getByRole('button', { name: 'London' }));

  // Then it says the folder is empty
  expect(screen.getByText('Empty folder')).toBeVisible();
});
