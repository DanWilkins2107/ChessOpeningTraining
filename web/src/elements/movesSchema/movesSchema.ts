// fallow-ignore-file unused-file -- ef93ff81 2026-10-15 landed ahead of the folder page, its first consumer.
import { z } from '../../z';
import { mapMovesToLineArray } from '../mapMovesToLineArray/mapMovesToLineArray';
import type { MoveNode } from '../MoveNode/MoveNode';

// move_trees.moves is checked against this shape by validate_move_tree_moves (supabase/migrations/0003_move_trees.sql).
// Once 0003 has run in production, changing the shape needs a new migration that replaces that check, not an edit to 0003.
// movesSchema mirrors that check exactly, so moves the database accepted always load.
const MAX_PLIES_PER_LINE = 600;
const MAX_LINES = 1000;

const moveNodeSchema: z.ZodType<MoveNode> = z.strictObject({
  san: z.string(),
  get children() {
    return z.array(moveNodeSchema);
  },
});

export const movesSchema: z.ZodType<MoveNode[]> = z
  .array(moveNodeSchema)
  .refine(
    (tree) =>
      mapMovesToLineArray(tree).every(
        (line) => line.length <= MAX_PLIES_PER_LINE,
      ),
    'A line can be at most 600 plies',
  )
  .refine(
    (tree) => mapMovesToLineArray(tree).length <= MAX_LINES,
    'Moves can have at most 1000 lines',
  );
