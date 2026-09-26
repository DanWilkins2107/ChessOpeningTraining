import { supabase } from '../../supabase';
import { TRY_AGAIN_MESSAGE } from '../newPasswordErrorMessage/newPasswordErrorMessage.constants';
import { newPasswordErrorMessage } from '../newPasswordErrorMessage/newPasswordErrorMessage';

type SaveOutcome = { saved?: boolean; error?: string; codeSent?: boolean };

export async function savePassword(
  password: string,
  nonce: string | undefined,
): Promise<SaveOutcome> {
  const { error } = await supabase.auth.updateUser({ password, nonce });
  if (!error) return { saved: true };
  if (error.code !== 'reauthentication_needed')
    return { error: newPasswordErrorMessage(error) };
  const sent = await supabase.auth.reauthenticate();
  return sent.error ? { error: TRY_AGAIN_MESSAGE } : { codeSent: true };
}
