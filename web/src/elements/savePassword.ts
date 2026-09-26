import { supabase } from '../supabase';
import { TRY_AGAIN, newPasswordErrorMessage } from './newPasswordErrorMessage';

type SaveOutcome = 'saved' | 'code-sent' | { error: string };

export async function savePassword(
  password: string,
  nonce: string,
): Promise<SaveOutcome> {
  const { error } = await supabase.auth.updateUser({ password, nonce });
  if (!error) return 'saved';
  if (error.code !== 'reauthentication_needed')
    return { error: newPasswordErrorMessage(error) };
  const sent = await supabase.auth.reauthenticate();
  return sent.error ? { error: TRY_AGAIN } : 'code-sent';
}
