import { useId, useState } from 'react';
import './TextInput.css';

type TextInputProps = {
  label: string;
  name: string;
  type: 'email' | 'password' | 'text';
  autoComplete: 'email' | 'current-password' | 'new-password' | 'off';
  maxLength?: number;
  onChange?: (value: string) => void;
};

export function TextInput({
  label,
  name,
  type,
  autoComplete,
  maxLength,
  onChange,
}: TextInputProps) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="text-input">
      <label htmlFor={id}>{label}</label>
      <div className="text-input-control">
        <input
          id={id}
          className="text-input-field"
          name={name}
          type={revealed ? 'text' : type}
          autoComplete={autoComplete}
          maxLength={maxLength}
          onChange={(event) => onChange?.(event.target.value)}
          required
        />
        {type === 'password' && (
          <button
            type="button"
            className="text-input-reveal"
            aria-label={revealed ? 'Hide password' : 'Show password'}
            onClick={() => setRevealed(!revealed)}
          >
            {revealed ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
    </div>
  );
}
