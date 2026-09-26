import { ErrorMessage } from '../../shared/ErrorMessage/ErrorMessage';
import { TextInput } from '../../shared/TextInput/TextInput';
import { PASSWORDS_DIFFER_MESSAGE } from './ConfirmPasswordInput.constants';

type ConfirmPasswordInputProps = {
  password: string;
  confirmation: string;
  onChange: (confirmation: string) => void;
};

export function ConfirmPasswordInput({
  password,
  confirmation,
  onChange,
}: ConfirmPasswordInputProps) {
  return (
    <>
      <TextInput
        label="Confirm new password"
        name="confirmation"
        type="password"
        autoComplete="new-password"
        onChange={onChange}
      />
      {confirmation && confirmation !== password && (
        <ErrorMessage>{PASSWORDS_DIFFER_MESSAGE}</ErrorMessage>
      )}
    </>
  );
}
