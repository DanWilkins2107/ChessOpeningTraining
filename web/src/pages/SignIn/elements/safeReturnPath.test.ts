import { expect, it } from 'vitest';
import { safeReturnPath } from './safeReturnPath';

const randomPath = () =>
  `/${crypto.randomUUID()}/${crypto.randomUUID()}?line=${crypto.randomUUID()}`;

it('keeps a same-origin path and query', () => {
  // Given a path and query on this site
  const next = randomPath();

  // When it is made safe
  const path = safeReturnPath(next);

  // Then it is unchanged
  expect(path).toBe(next);
});

it('keeps the path and query of an absolute URL on this site', () => {
  // Given an absolute URL on this site
  const next = randomPath();

  // When it is made safe
  const path = safeReturnPath(`${window.location.origin}${next}`);

  // Then only the path and query remain
  expect(path).toBe(next);
});

it('drops the fragment', () => {
  // Given a path with a fragment
  const next = randomPath();

  // When it is made safe
  const path = safeReturnPath(`${next}#${crypto.randomUUID()}`);

  // Then the fragment is gone
  expect(path).toBe(next);
});

it.each([
  ['no return path', null],
  ['another origin', 'https://evil.example/studies'],
  ['a protocol-relative URL', '//evil.example'],
  ['a backslash protocol-relative URL', '/\\evil.example'],
  ['a same-origin path resolving to //', '/.//evil.example'],
  ['a javascript: URL', 'javascript:alert(1)'],
  ['an unparseable URL', 'http://['],
])('falls back to / for %s', (_case, next) => {
  // Given an unsafe return path

  // When it is made safe
  const path = safeReturnPath(next);

  // Then it is the home page
  expect(path).toBe('/');
});
