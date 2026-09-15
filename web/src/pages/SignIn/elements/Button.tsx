import './Button.css';

type ButtonProps = {
  disabled: boolean;
  children: string;
};

export function Button({ disabled, children }: ButtonProps) {
  return (
    <button className="button" type="submit" disabled={disabled}>
      {children}
    </button>
  );
}
