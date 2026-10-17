import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeAll, expect, it } from 'vitest';
import { supabase } from '../../../../supabase';
import { registerTestUser } from '../../../../tests-shared/testUser';
import { CreateFolderForm } from './CreateFolderForm';
import { nameFormTests } from '../../tests-shared/nameFormTests';

const author = registerTestUser();
const atTheCap = registerTestUser();

beforeAll(async () => {
  await atTheCap.signIn();
  const { error } = await supabase.from('folders').insert(
    Array.from({ length: 100 }, (_, index) => ({
      name: `Filler ${index}`,
    })),
  );
  if (error) throw error;
  await supabase.auth.signOut({ scope: 'local' });
});

const createButton = () =>
  screen.getByRole('button', { name: 'Create folder' });

const nameField = () => screen.getByLabelText('Folder name');

function renderForm() {
  const creations: string[] = [];
  render(<CreateFolderForm onCreated={() => creations.push('created')} />);
  return creations;
}

async function signedInForm() {
  await author.signIn();
  return renderForm();
}

function submitFolder(name: string) {
  fireEvent.change(nameField(), { target: { value: name } });
  fireEvent.click(createButton());
}

async function createFolderNamed(creations: string[], name: string) {
  submitFolder(name);
  await waitFor(() => expect(creations).toHaveLength(1));
}

const newestFolder = async () =>
  (
    await supabase
      .from('folders')
      .select('name')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
  ).data;

it('creates a folder with the typed name', async () => {
  // Given a signed-in user on the form
  const creations = await signedInForm();

  // When they create a folder
  await createFolderNamed(creations, 'London');

  // Then it is stored
  expect(await newestFolder()).toEqual({ name: 'London' });
});

it('trims the name it stores', async () => {
  // Given a signed-in user on the form
  const creations = await signedInForm();

  // When they create a folder named with surrounding spaces
  await createFolderNamed(creations, '  Slav  ');

  // Then the stored name is trimmed
  expect((await newestFolder())?.name).toBe('Slav');
});

it('empties the name once the folder is created', async () => {
  // Given a signed-in user on the form
  const creations = await signedInForm();

  // When they create a folder
  await createFolderNamed(creations, 'Benoni');

  // Then the name field is empty again
  expect(nameField()).toHaveValue('');
});

it('disables create again once the folder is created', async () => {
  // Given a signed-in user on the form
  const creations = await signedInForm();

  // When they create a folder
  await createFolderNamed(creations, 'Alekhine');

  // Then create is disabled until another name is typed
  expect(createButton()).toBeDisabled();
});

nameFormTests({
  renderForm: () => renderForm(),
  signIn: () => author.signIn(),
  nameLabel: 'Folder name',
  createLabel: 'Create folder',
});

it('explains the 100-folder cap', async () => {
  // Given a signed-in user who already has 100 folders
  await atTheCap.signIn();
  renderForm();

  // When they create another
  submitFolder('One too many');

  // Then they are told about the cap
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'You can have at most 100 folders',
  );
});

it('shows a generic message when the folder cannot be created', async () => {
  // Given a signed-out visitor on the form
  renderForm();

  // When they create a folder
  submitFolder('Nobody else');

  // Then they get a generic message, not the server's error
  expect(await screen.findByRole('alert')).toHaveTextContent(
    "Couldn't create your folder, try again",
  );
});
