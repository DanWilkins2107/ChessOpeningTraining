import { env } from 'node:process';
import { vi } from 'vitest';

export async function latestMailTo(address: string): Promise<string> {
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
  return message.Text;
}
