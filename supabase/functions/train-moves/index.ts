import { createClient } from 'npm:@supabase/supabase-js@2.116.0';
// Not npm:postgres: its Node DNS lookup rejects the local stack's db hostname, which has underscores.
import postgres from 'https://deno.land/x/postgresjs@v3.4.7/mod.js';
import { corsHeaders } from '../_shared/cors.ts';
import { env } from './env.ts';
import { signedInUserId } from './signedInUserId.ts';
import { RejectedTraining, trainMoves } from './trainMoves.ts';
import {
  trainingRequestSchema,
  type TrainingRequest,
} from './trainingRequest.ts';

const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const sql = postgres(env.SUPABASE_DB_URL);

const respond = (body: object, status = 200) =>
  Response.json(body, { status, headers: corsHeaders });

async function trainingResponse(userId: string, training: TrainingRequest) {
  try {
    return respond({ skippedTreeIds: await trainMoves(sql, userId, training) });
  } catch (error) {
    if (!(error instanceof RejectedTraining)) throw error;
    return respond({ error: error.message }, error.status);
  }
}

async function handleTraining(request: Request) {
  const userId = await signedInUserId(admin, request);
  if (!userId) return respond({ error: 'Not signed in' }, 401);

  const training = trainingRequestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!training.success) return respond({ error: training.error.message }, 400);

  return trainingResponse(userId, training.data);
}

Deno.serve((request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return respond({ error: 'Method not allowed' }, 405);
  }
  return handleTraining(request);
});
