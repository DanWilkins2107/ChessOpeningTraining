import { expect, it } from 'vitest';
import { latestMailTo } from './tests-shared/mailpit';
import { admin, signedInUser } from './tests-shared/testUsers';

const storedEmail = async (id: string) =>
  (await admin.auth.admin.getUserById(id)).data.user?.email;

const linkMailedTo = async (address: string) =>
  (await latestMailTo(address)).match(/\( (\S+\/verify\?\S+) \)/)![1];

const follow = (link: string) => fetch(link, { redirect: 'manual' });

async function emailChangeRequested() {
  const user = await signedInUser();
  const newEmail = `test-${crypto.randomUUID()}@example.test`;
  const { error } = await user.client.auth.updateUser({ email: newEmail });
  if (error) throw error;
  return { ...user, newEmail };
}

it.each(['old', 'new'] as const)(
  'keeps the old email while only the %s inbox has confirmed',
  async (inbox) => {
    // Given a user who has asked to change their email
    const { id, email, newEmail } = await emailChangeRequested();

    // When only that inbox's link is followed
    await follow(await linkMailedTo(inbox === 'old' ? email : newEmail));

    // Then the email is unchanged
    expect(await storedEmail(id)).toBe(email);
  },
);

it('changes the email once both inboxes confirm', async () => {
  // Given a user who has asked to change their email
  const { id, email, newEmail } = await emailChangeRequested();

  // When the links in both inboxes are followed
  await follow(await linkMailedTo(newEmail));
  await follow(await linkMailedTo(email));

  // Then the account has the new email
  expect(await storedEmail(id)).toBe(newEmail);
});
