import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { env } from '../env';

const storageKey = `sb-${new URL(env.VITE_SUPABASE_URL).hostname.split('.')[0]}-auth-token`;

describe('SignOut', () => {
  it('matches snapshot', async () => {
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
    const { SignOut } = await import('./SignOut');
    const { authSettled } = await import('../../tests/authSettled');

    const { container } = render(<SignOut />);
    await authSettled();

    expect(container).toMatchSnapshot();
  });
});
