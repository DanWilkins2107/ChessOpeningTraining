import './Button.css';

type ButtonProps = {
  disabled: boolean;
  danger?: boolean;
  onClick?: () => void;
  children: string;
};

export function Button({
  disabled,
  danger = false,
  onClick,
  children,
}: ButtonProps) {
  return (
    <button
      className={danger ? 'button button-danger' : 'button'}
      type={onClick ? 'button' : 'submit'}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
