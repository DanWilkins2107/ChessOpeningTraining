import type { ComponentProps } from 'react';
import './TextInput.css';

type TextInputProps = Omit<ComponentProps<'input'>, 'className'> & {
  label: string;
};

export function TextInput({ label, ...inputProps }: TextInputProps) {
  return (
    <label className="text-input">
      {label}
      <input className="text-input-field" {...inputProps} />
    </label>
  );
}
