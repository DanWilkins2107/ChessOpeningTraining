import type {
  Sql,
  TransactionSql,
} from 'https://deno.land/x/postgresjs@v3.4.7/mod.js';
import type { TrainingRequest } from './trainingRequest.ts';
import {
  trainedMoves,
  userMoveCount,
  type Side,
  type TrainedMove,
} from './trainedMoves.ts';

type MoveTree = { id: string; side: Side; moves: TrainedMove[] };

export class RejectedTraining extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function lockedMoveTrees(
  tx: TransactionSql,
  userId: string,
  treeIds: string[],
) {
  // Locked in id order, so concurrent calls over overlapping trees cannot deadlock.
  const trees = await tx<MoveTree[]>`
    select id, side, moves from public.move_trees
    where id = any(${treeIds}::uuid[]) and owner_id = ${userId}
    order by id
    for update`;
  if (trees.length !== new Set(treeIds).size) {
    throw new RejectedTraining('Move trees not found', 403);
  }
  return trees;
}

// Which plies are the user's depends on the side, so one path cannot train both.
function sharedSide(trees: MoveTree[]) {
  if (new Set(trees.map((tree) => tree.side)).size !== 1) {
    throw new RejectedTraining('Move trees must all be for the same side', 400);
  }
  return trees[0].side;
}

// Returns the ids of the trees skipped because the path is no longer in them.
export function trainMoves(
  sql: Sql,
  userId: string,
  training: TrainingRequest,
) {
  return sql.begin(async (tx) => {
    const trees = await lockedMoveTrees(tx, userId, training.treeIds);
    const side = sharedSide(trees);
    const skippedTreeIds: string[] = [];

    for (const tree of trees) {
      const moves = trainedMoves(
        tree.moves,
        side,
        training.path,
        training.confidenceChanges,
      );
      if (moves) {
        await tx`update public.move_trees set moves = ${tx.json(moves)} where id = ${tree.id}`;
      } else {
        skippedTreeIds.push(tree.id);
      }
    }

    await tx`
      insert into public.training_days (owner_id, day, moves_trained)
      values (${userId}, ${training.day}, ${userMoveCount(training.path, side)})
      on conflict (owner_id, day) do update
        set moves_trained = training_days.moves_trained + excluded.moves_trained`;

    return skippedTreeIds;
  });
}
