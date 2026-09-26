import type { User } from '@supabase/supabase-js';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CurrentEmail } from './CurrentEmail';

describe('CurrentEmail', () => {
  it('matches snapshot', () => {
    const user = {
      email: 'old@example.test',
      new_email: 'new@example.test',
    } as User;
    const { container } = render(<CurrentEmail user={user} />);
    expect(container).toMatchSnapshot();
  });
});
