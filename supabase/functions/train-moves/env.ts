import { z } from 'npm:zod@4.5.4';

export const env = z
  .object({
    SUPABASE_URL: z.url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    SUPABASE_DB_URL: z.string().min(1),
    ALLOWED_ORIGIN: z.url(),
  })
  .parse(Deno.env.toObject());
