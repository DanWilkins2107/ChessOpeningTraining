import './Spinner.css';

type SpinnerProps = {
  label: string;
};

export function Spinner({ label }: SpinnerProps) {
  return <div role="status" aria-label={label} className="spinner" />;
}
