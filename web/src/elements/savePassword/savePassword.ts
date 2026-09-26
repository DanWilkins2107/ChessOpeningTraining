import { supabase } from '../../supabase';
import {
  TRY_AGAIN,
  newPasswordErrorMessage,
} from '../newPasswordErrorMessage/newPasswordErrorMessage';

type SaveOutcome =
  | { status: 'saved' | 'code-sent'; error?: undefined }
  | { status: 'failed'; error: string };

export async function savePassword(
  password: string,
  nonce: string | undefined,
): Promise<SaveOutcome> {
  const { error } = await supabase.auth.updateUser({ password, nonce });
  if (!error) return { status: 'saved' };
  if (error.code !== 'reauthentication_needed')
    return { status: 'failed', error: newPasswordErrorMessage(error) };
  const sent = await supabase.auth.reauthenticate();
  return sent.error
    ? { status: 'failed', error: TRY_AGAIN }
    : { status: 'code-sent' };
}
