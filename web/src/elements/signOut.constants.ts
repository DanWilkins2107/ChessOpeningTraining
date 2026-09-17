// Signing out clears this device's session, so the account page is gone before
// it could report anything. It hands the outcome to the sign-in page as a query
// parameter instead, and that page looks the wording up here.
export const SIGNED_OUT_PARAM = 'signedOut';
export const SIGNED_OUT_PENDING = 'pending';
export const SIGNED_OUT_DONE = 'done';
export const SIGNED_OUT_FAILED = 'failed';

export const SIGN_OUT_NOTICES = new Map<string | null, string>([
  [SIGNED_OUT_PENDING, 'Signing out'],
  [SIGNED_OUT_DONE, 'Sign out successful'],
  [
    SIGNED_OUT_FAILED,
    'Signed out on this device. The server did not confirm it.',
  ],
]);
