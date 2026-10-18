// Calls public.train_moves (supabase/migrations/0009_train_moves.sql), which trusts the user_id passed here.
// Moving either means updating the other's reference.
import { createClient } from 'npm:@supabase/supabase-js@2.116.0';
import { z } from 'npm:zod@4.5.4';

const env = z
  .object({
    SUPABASE_URL: z.url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  })
  .parse(Deno.env.toObject());

const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const trainingSchema = z.object({
  treeIds: z.array(z.uuid()),
  path: z.array(z.string()),
  confidenceChanges: z.array(z.int()),
  day: z.iso.date(),
});

// Postgres error codes train_moves raises for a bad request.
const REQUEST_ERROR_STATUSES: Record<string, number> = {
  '23514': 400,
  '42501': 403,
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const respond = (body: object, status = 200) =>
  Response.json(body, { status, headers: corsHeaders });

async function signedInUserId(request: Request) {
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '');
  const { data } = await admin.auth.getUser(token);
  return data.user?.id;
}

async function trainMoves(
  userId: string,
  training: z.infer<typeof trainingSchema>,
) {
  const { data, error } = await admin.rpc('train_moves', {
    user_id: userId,
    tree_ids: training.treeIds,
    path: training.path,
    confidence_changes: training.confidenceChanges,
    day: training.day,
  });
  if (error) {
    const status = REQUEST_ERROR_STATUSES[error.code];
    if (!status) throw error;
    return respond({ error: error.message }, status);
  }

  return respond({ skippedTreeIds: data });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const userId = await signedInUserId(request);
  if (!userId) return respond({ error: 'Not signed in' }, 401);

  const training = trainingSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!training.success) return respond({ error: training.error.message }, 400);

  return trainMoves(userId, training.data);
});
