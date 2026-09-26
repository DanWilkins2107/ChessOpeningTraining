import './SuccessMessage.css';

type SuccessMessageProps = {
  children: string;
};

export function SuccessMessage({ children }: SuccessMessageProps) {
  return (
    <p role="status" className="success-message">
      {children}
    </p>
  );
}
