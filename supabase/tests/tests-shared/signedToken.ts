import { createHmac } from 'node:crypto';
import { env } from 'node:process';

const base64url = (value: object) =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

// For a session the auth server would never issue, signed with the stack's own
// secret.
export function signedToken(claims: object) {
  const unsigned = `${base64url({ alg: 'HS256', typ: 'JWT' })}.${base64url(claims)}`;
  const signature = createHmac('sha256', env.SUPABASE_JWT_SECRET!)
    .update(unsigned)
    .digest('base64url');
  return `${unsigned}.${signature}`;
}
