import './ErrorMessage.css';

type ErrorMessageProps = {
  children: string;
};

export function ErrorMessage({ children }: ErrorMessageProps) {
  return (
    <p role="alert" className="error-message">
      {children}
    </p>
  );
}
