import './Button.css';

type ButtonProps = {
  disabled: boolean;
  danger?: boolean;
  onClick?: () => void;
  autoFocus?: boolean;
  children: string;
};

export function Button({
  disabled,
  danger = false,
  onClick,
  autoFocus = false,
  children,
}: ButtonProps) {
  return (
    <button
      className={danger ? 'button button-danger' : 'button'}
      type={onClick ? 'button' : 'submit'}
      disabled={disabled}
      onClick={onClick}
      autoFocus={autoFocus}
    >
      {children}
    </button>
  );
}
