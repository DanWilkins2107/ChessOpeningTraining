// Supabase reports the email change link back in the hash. Its own wording is
// not shown, so a crafted link cannot put arbitrary text on the page.
export function emailLinkNotice(hash: string) {
  const params = new URLSearchParams(hash.slice(1));
  if (params.has('error')) {
    return {
      confirmed: false,
      text: 'That link has expired or was already used. Enter your new email again to get fresh links',
      clearHash: true,
    };
  }
  if (params.has('message')) {
    return {
      confirmed: true,
      text: 'Confirmed, now open the link sent to your other email',
      clearHash: true,
    };
  }
  // The last link carries the new session, which Supabase reads from the hash
  // and then clears itself.
  if (params.get('type') === 'email_change') {
    return { confirmed: true, text: 'Email changed', clearHash: false };
  }
  return undefined;
}
