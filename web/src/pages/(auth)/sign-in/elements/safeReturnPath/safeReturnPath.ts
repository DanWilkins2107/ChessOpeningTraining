export function safeReturnPath(next: string | null): string {
  const { origin } = window.location;
  const url = URL.parse(next ?? '', origin);

  if (url?.origin !== origin || url.pathname.startsWith('//')) return '/';
  return url.pathname + url.search;
}
