import { createClient } from '@supabase/supabase-js';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest';
import { env } from '../env';
import { supabase } from '../supabase';
import { SignOut } from './SignOut';

const admin = createClient(
  env.VITE_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const credentials = {
  email: `sign-out-${crypto.randomUUID()}@example.test`,
  password: crypto.randomUUID(),
};

let userId: string;

beforeAll(async () => {
  const { data, error } = await admin.auth.admin.createUser({
    ...credentials,
    email_confirm: true,
  });
  if (error) throw error;
  userId = data.user.id;
});

afterAll(async () => {
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw error;
});

afterEach(async () => {
  cleanup();
  vi.restoreAllMocks();
  await supabase.auth.signOut({ scope: 'local' });
});

const renderSignOut = () => act(async () => render(<SignOut />));

async function signIn(client = supabase) {
  const { error } = await client.auth.signInWithPassword(credentials);
  if (error) throw error;
}

it('renders nothing when signed out', async () => {
  // Given nobody is signed in

  // When it renders
  const { container } = await renderSignOut();

  // Then it is empty
  expect(container).toBeEmptyDOMElement();
});

it('signs out this device only', async () => {
  // Given the user signed in here and on another device
  const otherDevice = createClient(
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  await signIn(otherDevice);
  await signIn();
  await renderSignOut();

  // When they sign out here
  fireEvent.click(await screen.findByRole('button', { name: 'Sign out' }));

  // Then the button goes, with no error, and the other device stays signed in
  await vi.waitFor(() =>
    expect(screen.queryByRole('button')).not.toBeInTheDocument(),
  );
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  const { error } = await otherDevice.auth.refreshSession();
  expect(error).toBeNull();
});

it('shows the server error where the button was', async () => {
  // Given a signed-in user, and a server that fails to sign them out
  await signIn();
  await renderSignOut();
  const realFetch = globalThis.fetch;
  // mock-reason: the local auth server cannot be made to fail a logout on
  // demand. Only the logout request is failed; everything else is real.
  vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) =>
    String(input).includes('/logout')
      ? Promise.resolve(
          Response.json({ msg: 'Logout failed' }, { status: 500 }),
        )
      : realFetch(input, init),
  );

  // When they sign out
  fireEvent.click(await screen.findByRole('button', { name: 'Sign out' }));

  // Then the error replaces the button
  expect(await screen.findByRole('alert')).toHaveTextContent('Logout failed');
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
