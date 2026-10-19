import { supabase } from '../../../../supabase';
import { TRY_AGAIN_MESSAGE } from '../../../../shared/newPasswordErrorMessage/newPasswordErrorMessage.constants';
import { newPasswordErrorMessage } from '../../../../shared/newPasswordErrorMessage/newPasswordErrorMessage';

type SaveOutcome = { error?: string; codeSent?: boolean };

export async function savePassword(password: string): Promise<SaveOutcome> {
  const { error } = await supabase.auth.updateUser({ password });
  if (!error) return {};
  if (error.code !== 'reauthentication_needed')
    return { error: newPasswordErrorMessage(error) };
  const sent = await supabase.auth.reauthenticate();
  return sent.error ? { error: TRY_AGAIN_MESSAGE } : { codeSent: true };
}
