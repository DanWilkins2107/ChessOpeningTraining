import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeAll, expect, it } from 'vitest';
import { supabase } from '../../../../../supabase';
import { registerTestUser } from '../../../../../tests-shared/testUser';
import { CreateMoveTreeForm } from './CreateMoveTreeForm';
import { nameFormTests } from '../../../tests-shared/nameFormTests';

const moveTreeAuthor = registerTestUser();
const atTheMoveTreeCap = registerTestUser();
const londonFolder = { id: '' };

beforeAll(async () => {
  await moveTreeAuthor.signIn();
  const { data, error } = await supabase
    .from('folders')
    .insert({ name: 'London' })
    .select('id')
    .single();
  if (error) throw error;
  londonFolder.id = data.id;

  await atTheMoveTreeCap.signIn();
  const filled = await supabase.from('move_trees').insert(
    Array.from({ length: 500 }, (_, index) => ({
      name: `Filler ${index}`,
      side: 'white',
    })),
  );
  if (filled.error) throw filled.error;
  await supabase.auth.signOut({ scope: 'local' });
});

const createMoveTreeButton = () =>
  screen.getByRole('button', { name: 'Create move tree' });

const moveTreeNameField = () => screen.getByLabelText('Move tree name');

function renderMoveTreeForm(folderId: string | null = londonFolder.id) {
  const creations: string[] = [];
  render(
    <CreateMoveTreeForm
      folderId={folderId}
      onCreated={() => creations.push('created')}
    />,
  );
  return creations;
}

async function signedInMoveTreeForm(folderId?: string | null) {
  await moveTreeAuthor.signIn();
  return renderMoveTreeForm(folderId);
}

function submitMoveTree(name: string) {
  fireEvent.change(moveTreeNameField(), { target: { value: name } });
  fireEvent.click(createMoveTreeButton());
}

async function createMoveTreeNamed(creations: string[], name: string) {
  submitMoveTree(name);
  await waitFor(() => expect(creations).toHaveLength(1));
}

const newestMoveTree = async () =>
  (
    await supabase
      .from('move_trees')
      .select('folder_id, name, side')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
  ).data;

it('creates a white move tree in the folder by default', async () => {
  // Given a signed-in user on the form for their folder
  const creations = await signedInMoveTreeForm();

  // When they create a move tree without choosing a side
  await createMoveTreeNamed(creations, 'Main line');

  // Then it is stored in that folder as a white move tree
  expect(await newestMoveTree()).toEqual({
    folder_id: londonFolder.id,
    name: 'Main line',
    side: 'white',
  });
});

it('creates a move tree on the chosen side', async () => {
  // Given a signed-in user on the form
  const creations = await signedInMoveTreeForm();

  // When they choose black and create a move tree
  fireEvent.click(screen.getByLabelText('black'));
  await createMoveTreeNamed(creations, 'Caro-Kann');

  // Then it is stored as a black move tree
  expect((await newestMoveTree())?.side).toBe('black');
});

it('creates a top-level move tree without a folder', async () => {
  // Given a signed-in user on a form with no folder
  const creations = await signedInMoveTreeForm(null);

  // When they create a move tree
  await createMoveTreeNamed(creations, 'Sidelines');

  // Then it is stored outside any folder
  expect(await newestMoveTree()).toEqual({
    folder_id: null,
    name: 'Sidelines',
    side: 'white',
  });
});

it('trims the name it stores', async () => {
  // Given a signed-in user on the form
  const creations = await signedInMoveTreeForm();

  // When they create a move tree named with surrounding spaces
  await createMoveTreeNamed(creations, '  Slav  ');

  // Then the stored name is trimmed
  expect((await newestMoveTree())?.name).toBe('Slav');
});

it('resets the name and side once the move tree is created', async () => {
  // Given a signed-in user on the form, with black chosen
  const creations = await signedInMoveTreeForm();
  fireEvent.click(screen.getByLabelText('black'));

  // When they create a move tree
  await createMoveTreeNamed(creations, 'Benoni');

  // Then the name is empty, white is chosen, and create is disabled again
  expect(moveTreeNameField()).toHaveValue('');
  expect(screen.getByLabelText('white')).toBeChecked();
  expect(createMoveTreeButton()).toBeDisabled();
});

nameFormTests({
  renderForm: () => renderMoveTreeForm(),
  signIn: () => moveTreeAuthor.signIn(),
  nameLabel: 'Move tree name',
  createLabel: 'Create move tree',
});

it('explains the 500-move-tree cap', async () => {
  // Given a signed-in user who already has 500 move trees
  await atTheMoveTreeCap.signIn();
  renderMoveTreeForm(null);

  // When they create another
  submitMoveTree('One too many');

  // Then they are told about the cap
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'You can have at most 500 move trees',
  );
});

it('shows a generic message when the move tree cannot be created', async () => {
  // Given a signed-out visitor on the form
  renderMoveTreeForm();

  // When they create a move tree
  submitMoveTree('Nobody else');

  // Then they get a generic message, not the server's error
  expect(await screen.findByRole('alert')).toHaveTextContent(
    "Couldn't create your move tree, try again",
  );
});
