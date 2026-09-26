import { TextInput } from './TextInput';

type ReauthenticationCodeInputProps = {
  onChange: (code: string) => void;
};

export function ReauthenticationCodeInput({
  onChange,
}: ReauthenticationCodeInputProps) {
  return (
    <>
      <p>We've emailed you a code to confirm it's you</p>
      <TextInput
        label="Code"
        name="code"
        type="text"
        autoComplete="one-time-code"
        onChange={onChange}
      />
    </>
  );
}
