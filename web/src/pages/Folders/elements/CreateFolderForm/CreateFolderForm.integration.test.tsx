import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeAll, expect, it } from 'vitest';
import { supabase } from '../../../../supabase';
import { registerTestUser } from '../../../../tests-shared/testUser';
import { CreateFolderForm } from './CreateFolderForm';

const author = registerTestUser();
const atTheCap = registerTestUser();

beforeAll(async () => {
  await atTheCap.signIn();
  const { error } = await supabase.from('folders').insert(
    Array.from({ length: 100 }, (_, index) => ({
      name: `Filler ${index}`,
      side: 'white',
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
      .select('name, side')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
  ).data;

it('creates a white folder by default', async () => {
  // Given a signed-in user on the form
  const creations = await signedInForm();

  // When they create a folder without choosing a side
  await createFolderNamed(creations, 'London');

  // Then it is stored as a white folder
  expect(await newestFolder()).toEqual({ name: 'London', side: 'white' });
});

it('creates a folder on the chosen side', async () => {
  // Given a signed-in user on the form
  const creations = await signedInForm();

  // When they choose black and create a folder
  fireEvent.click(screen.getByLabelText('black'));
  await createFolderNamed(creations, 'Caro-Kann');

  // Then it is stored as a black folder
  expect(await newestFolder()).toEqual({ name: 'Caro-Kann', side: 'black' });
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

it('clears an earlier failure once a folder is created', async () => {
  // Given a failed create on the form
  const creations = renderForm();
  submitFolder('Dutch');
  await screen.findByRole('alert');

  // When the user signs in and creates it again
  await author.signIn();
  fireEvent.click(createButton());
  await waitFor(() => expect(creations).toHaveLength(1));

  // Then the message is gone
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('keeps create disabled until a name is typed', () => {
  // Given the form

  // When it renders
  renderForm();

  // Then create is disabled
  expect(createButton()).toBeDisabled();
});

it('keeps create disabled for a name of only spaces', () => {
  // Given the form
  renderForm();

  // When only spaces are typed
  fireEvent.change(nameField(), { target: { value: '   ' } });

  // Then create is still disabled
  expect(createButton()).toBeDisabled();
});

it('enables create once a name is typed', () => {
  // Given the form
  renderForm();

  // When a name is typed
  fireEvent.change(nameField(), { target: { value: 'Pirc' } });

  // Then create is enabled
  expect(createButton()).toBeEnabled();
});

it('caps the name at 100 characters', () => {
  // Given the form

  // When it renders
  renderForm();

  // Then the name field takes no more than 100 characters
  expect(nameField()).toHaveAttribute('maxlength', '100');
});

it('disables create until the attempt finishes', async () => {
  // Given a named folder on the form
  renderForm();
  fireEvent.change(nameField(), { target: { value: 'Grunfeld' } });

  // When the form is submitted
  const submitted = fireEvent.submit(createButton().closest('form')!);

  // Then the browser's own submission is cancelled, and create is disabled
  // until the attempt finishes
  expect(submitted).toBe(false);
  expect(createButton()).toBeDisabled();
  await screen.findByRole('alert');
  expect(createButton()).toBeEnabled();
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
