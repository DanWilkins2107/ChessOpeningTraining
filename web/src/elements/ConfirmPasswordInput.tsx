import { TextInput } from './TextInput';

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
        <p>Passwords don't match</p>
      )}
    </>
  );
}
