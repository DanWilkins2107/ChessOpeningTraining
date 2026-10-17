import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import { supabase } from '../../supabase';
import { registerTestUser } from '../../tests-shared/testUser';
import { Repertoire } from './page';

const pageUser = registerTestUser();

it('creates a folder from the page', async () => {
  // Given a signed-in user on the page
  await pageUser.signIn();
  render(<Repertoire />, { wrapper: MemoryRouter });

  // When they create a folder
  fireEvent.change(screen.getByLabelText('Folder name'), {
    target: { value: 'Najdorf' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Create folder' }));

  // Then the field clears and the folder is saved
  await waitFor(() =>
    expect(screen.getByLabelText('Folder name')).toHaveValue(''),
  );
  const { data } = await supabase.from('folders').select('name');
  expect(data).toEqual([{ name: 'Najdorf' }]);
});
