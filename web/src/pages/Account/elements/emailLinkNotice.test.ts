import { expect, it } from 'vitest';
import { emailLinkNotice } from './emailLinkNotice';

it('confirms the first of the two links', () => {
  // Given the hash Supabase adds after the first link is opened
  const hash =
    '#message=Confirmation+link+accepted.+Please+proceed+to+confirm+link+sent+to+the+other+email';

  // When it is read
  const notice = emailLinkNotice(hash);

  // Then it points them at the other link, in its own words
  expect(notice).toEqual({
    confirmed: true,
    text: 'Confirmed, now open the link sent to your other email',
  });
});

it('reports a failed link without repeating its wording', () => {
  // Given an error hash carrying text of its own
  const hash = `#error=access_denied&error_code=otp_expired&error_description=${crypto.randomUUID()}`;

  // When it is read
  const notice = emailLinkNotice(hash);

  // Then it is a fixed error
  expect(notice).toEqual({
    confirmed: false,
    text: 'That link is invalid or has expired',
  });
});

it.each([
  ['no hash', ''],
  ['an unrelated hash', '#section'],
])('has nothing to say for %s', (_case, hash) => {
  // Given a hash that is not about an email link

  // When it is read
  const notice = emailLinkNotice(hash);

  // Then there is no notice
  expect(notice).toBeUndefined();
});
