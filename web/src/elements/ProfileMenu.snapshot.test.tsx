import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { env } from '../env';

const storageKey = `sb-${new URL(env.VITE_SUPABASE_URL).hostname.split('.')[0]}-auth-token`;

async function renderSignedIn() {
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: 4102444800,
      user: { id: 'user-id' },
    }),
  );
  const { ProfileMenu } = await import('./ProfileMenu');
  const { authSettled } = await import('../tests-shared/authSettled');

  const { container } = render(
    <MemoryRouter>
      <ProfileMenu />
    </MemoryRouter>,
  );
  await authSettled();
  return container;
}

afterEach(cleanup);

describe('ProfileMenu', () => {
  it('matches snapshot', async () => {
    const container = await renderSignedIn();

    expect(container).toMatchSnapshot();
  });

  it('matches snapshot when open', async () => {
    const container = await renderSignedIn();

    fireEvent.click(screen.getByRole('button', { name: 'Profile' }));

    expect(container).toMatchSnapshot();
  });
});
