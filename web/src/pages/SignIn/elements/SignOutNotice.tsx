import { ErrorMessage } from '../../../elements/ErrorMessage';
import { SIGNED_OUT_FAILED } from '../../../elements/signOut.constants';
import { SuccessMessage } from '../../../elements/SuccessMessage';
import { signOutNotice } from './signOutOutcome';

export function SignOutNotice({ outcome }: { outcome: string | null }) {
  const notice = signOutNotice(outcome);
  if (notice === undefined) return null;

  return outcome === SIGNED_OUT_FAILED ? (
    <ErrorMessage>{notice}</ErrorMessage>
  ) : (
    <SuccessMessage>{notice}</SuccessMessage>
  );
}
