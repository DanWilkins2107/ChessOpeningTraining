import { TextInput } from '../../shared/TextInput/TextInput';
import { CODE_SENT_MESSAGE } from './ReauthenticationCodeInput.constants';

export function ReauthenticationCodeInput() {
  return (
    <>
      <p>{CODE_SENT_MESSAGE}</p>
      <TextInput
        label="Code"
        name="code"
        type="text"
        autoComplete="one-time-code"
      />
    </>
  );
}
