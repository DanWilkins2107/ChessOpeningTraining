import './Button.css';

type ButtonProps = {
  disabled: boolean;
  danger?: boolean;
  children: string;
};

export function Button({ disabled, danger = false, children }: ButtonProps) {
  return (
    <button
      className={danger ? 'button button-danger' : 'button'}
      type="submit"
      disabled={disabled}
    >
      {children}
    </button>
  );
}
