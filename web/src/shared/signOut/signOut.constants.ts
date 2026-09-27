// Signing out clears this device's session, so the account page is gone before
// it could report anything. It hands the outcome to the sign-in page as a query
// parameter instead, and that page looks the wording up here.
//
// There is no failure wording: `scope: 'local'` drops this device's session
// whether or not the server confirms it, and never touches other devices, so
// every sign out ends the same way for the person pressing the button.
export const SIGNED_OUT_PARAM = 'signedOut';
export const SIGNED_OUT_PENDING = 'pending';
export const SIGNED_OUT_DONE = 'done';
export const SIGNED_OUT_ACCOUNT_DELETED = 'accountDeleted';

export const SIGN_OUT_NOTICES = new Map<string | null, string>([
  [SIGNED_OUT_PENDING, 'Signing out'],
  [SIGNED_OUT_DONE, 'Sign out successful'],
  [SIGNED_OUT_ACCOUNT_DELETED, 'Account deleted'],
]);
