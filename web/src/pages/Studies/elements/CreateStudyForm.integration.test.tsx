import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeAll, expect, it } from 'vitest';
import { supabase } from '../../../supabase';
import { registerTestUser } from '../../../tests-shared/testUser';
import { withQueryClient } from '../../../tests-shared/withQueryClient';
import { CreateStudyForm } from './CreateStudyForm';

const author = registerTestUser();
const atTheCap = registerTestUser();

beforeAll(async () => {
  await atTheCap.signIn();
  const { error } = await supabase.from('studies').insert(
    Array.from({ length: 100 }, (_, index) => ({
      name: `Filler ${index}`,
      side: 'white',
    })),
  );
  if (error) throw error;
  await supabase.auth.signOut({ scope: 'local' });
});

const createButton = () => screen.getByRole('button', { name: 'Create study' });

const nameField = () => screen.getByLabelText('Study name');

function renderForm() {
  render(withQueryClient(<CreateStudyForm />));
}

async function signedInForm() {
  await author.signIn();
  renderForm();
}

function submitStudy(name: string) {
  fireEvent.change(nameField(), { target: { value: name } });
  fireEvent.click(createButton());
}

// The form empties the name only once the study is created.
async function createStudyNamed(name: string) {
  submitStudy(name);
  await waitFor(() => expect(nameField()).toHaveValue(''));
}

const newestStudy = async () =>
  (
    await supabase
      .from('studies')
      .select('name, side')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
  ).data;

it('creates a white study by default', async () => {
  // Given a signed-in user on the form
  await signedInForm();

  // When they create a study without choosing a side
  await createStudyNamed('London');

  // Then it is stored as a white study
  expect(await newestStudy()).toEqual({ name: 'London', side: 'white' });
});

it('creates a study on the chosen side', async () => {
  // Given a signed-in user on the form
  await signedInForm();

  // When they choose black and create a study
  fireEvent.click(screen.getByLabelText('black'));
  await createStudyNamed('Caro-Kann');

  // Then it is stored as a black study
  expect(await newestStudy()).toEqual({ name: 'Caro-Kann', side: 'black' });
});

it('trims the name it stores', async () => {
  // Given a signed-in user on the form
  await signedInForm();

  // When they create a study named with surrounding spaces
  await createStudyNamed('  Slav  ');

  // Then the stored name is trimmed
  expect((await newestStudy())?.name).toBe('Slav');
});

it('empties the name once the study is created', async () => {
  // Given a signed-in user on the form
  await signedInForm();

  // When they create a study
  await createStudyNamed('Benoni');

  // Then the name field is empty again
  expect(nameField()).toHaveValue('');
});

it('disables create again once the study is created', async () => {
  // Given a signed-in user on the form
  await signedInForm();

  // When they create a study
  await createStudyNamed('Alekhine');

  // Then create is disabled until another name is typed
  expect(createButton()).toBeDisabled();
});

it('clears an earlier failure once a study is created', async () => {
  // Given a failed create on the form
  renderForm();
  submitStudy('Dutch');
  await screen.findByRole('alert');

  // When the user signs in and creates it again
  await author.signIn();
  fireEvent.click(createButton());
  await waitFor(() => expect(nameField()).toHaveValue(''));

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
  // Given a named study on the form
  renderForm();
  fireEvent.change(nameField(), { target: { value: 'Grunfeld' } });

  // When the form is submitted
  const submitted = fireEvent.submit(createButton().closest('form')!);

  // Then the browser's own submission is cancelled, and create is disabled
  // until the attempt finishes
  expect(submitted).toBe(false);
  await waitFor(() => expect(createButton()).toBeDisabled());
  await screen.findByRole('alert');
  expect(createButton()).toBeEnabled();
});

it('explains the 100-study cap', async () => {
  // Given a signed-in user who already has 100 studies
  await atTheCap.signIn();
  renderForm();

  // When they create another
  submitStudy('One too many');

  // Then they are told about the cap
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'You can have at most 100 studies',
  );
});

it('shows a generic message when the study cannot be created', async () => {
  // Given a signed-out visitor on the form
  renderForm();

  // When they create a study
  submitStudy('Nobody else');

  // Then they get a generic message, not the server's error
  expect(await screen.findByRole('alert')).toHaveTextContent(
    "Couldn't create your study, try again",
  );
});
