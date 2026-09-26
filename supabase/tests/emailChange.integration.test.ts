import { env } from 'node:process';
import { expect, it, vi } from 'vitest';
import { admin, signedInUser } from './tests-shared/testUsers';

const ACCOUNT_URL = 'http://localhost:5173/account';

const storedEmail = async (id: string) =>
  (await admin.auth.admin.getUserById(id)).data.user?.email;

async function linkMailedTo(address: string) {
  const search = new URL('/api/v1/search', env.MAILPIT_URL);
  search.searchParams.set('query', `to:"${address}"`);
  const { messages } = await vi.waitFor(async () => {
    const found = await (await fetch(search)).json();
    if (found.messages.length === 0) throw new Error(`No mail to ${address}`);
    return found;
  });
  const message = await (
    await fetch(new URL(`/api/v1/message/${messages[0].ID}`, env.MAILPIT_URL))
  ).json();
  return message.Text.match(/\( (\S+\/verify\?\S+) \)/)[1];
}

const follow = async (link: string) =>
  (await fetch(link, { redirect: 'manual' })).headers.get('location');

async function emailChangeRequested() {
  const user = await signedInUser();
  const newEmail = `test-${crypto.randomUUID()}@example.test`;
  const { error } = await user.client.auth.updateUser(
    { email: newEmail },
    { emailRedirectTo: ACCOUNT_URL },
  );
  if (error) throw error;
  return { ...user, newEmail };
}

it('keeps the old email while only one inbox has confirmed', async () => {
  // Given a user who has asked to change their email
  const { id, email, newEmail } = await emailChangeRequested();

  // When only the new inbox's link is followed
  const landing = await follow(await linkMailedTo(newEmail));

  // Then the email is unchanged, and the account page is told to wait
  expect(landing).toMatch(new RegExp(`^${ACCOUNT_URL}#message=`));
  expect(await storedEmail(id)).toBe(email);
});

it('changes the email once both inboxes confirm', async () => {
  // Given a user who has asked to change their email
  const { id, email, newEmail } = await emailChangeRequested();

  // When the links in both inboxes are followed
  await follow(await linkMailedTo(newEmail));
  await follow(await linkMailedTo(email));

  // Then the account has the new email
  expect(await storedEmail(id)).toBe(newEmail);
});
