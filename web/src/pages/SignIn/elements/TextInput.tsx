import './TextInput.css';

type TextInputProps = {
  label: string;
  name: string;
  type: 'email' | 'password';
  autoComplete: 'email' | 'current-password';
};

export function TextInput({ label, name, type, autoComplete }: TextInputProps) {
  return (
    <label className="text-input">
      {label}
      <input
        className="text-input-field"
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
      />
    </label>
  );
}
