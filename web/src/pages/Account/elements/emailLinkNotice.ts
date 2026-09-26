// Supabase reports the email change link back in the hash. Its own wording is
// not shown, so a crafted link cannot put arbitrary text on the page.
export function emailLinkNotice(hash: string) {
  const params = new URLSearchParams(hash.slice(1));
  if (params.has('error')) {
    return { confirmed: false, text: 'That link is invalid or has expired' };
  }
  if (params.has('message')) {
    return {
      confirmed: true,
      text: 'Confirmed, now open the link sent to your other email',
    };
  }
  return undefined;
}
