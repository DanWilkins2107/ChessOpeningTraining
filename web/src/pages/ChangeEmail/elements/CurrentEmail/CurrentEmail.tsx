import type { User } from '@supabase/supabase-js';
import { SuccessMessage } from '../../../../shared/SuccessMessage/SuccessMessage';
import './CurrentEmail.css';

type CurrentEmailProps = {
  user: User;
};

export function CurrentEmail({ user }: CurrentEmailProps) {
  return (
    <>
      <p className="current-email">Current email: {user.email}</p>
      {user.new_email && (
        <SuccessMessage>{`Check both inboxes to confirm the change to ${user.new_email}`}</SuccessMessage>
      )}
    </>
  );
}
