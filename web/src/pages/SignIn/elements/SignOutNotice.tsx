import './SignOutNotice.css';

export function SignOutNotice({ notice }: { notice?: string }) {
  if (notice === undefined) return null;

  return (
    <p role="status" className="sign-out-notice">
      {notice}
    </p>
  );
}
