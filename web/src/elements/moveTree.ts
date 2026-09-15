import { z } from '../zod';

// chapters.move_tree is checked against this shape by validate_chapter_move_tree (supabase/migrations/0003_chapters.sql).
// Changing the shape needs a new migration that replaces that check; never edit 0003.
// moveTreeSchema mirrors that check exactly, so a tree the database accepted always loads.
export type MoveNode = {
  san: string;
  children: MoveNode[];
};

export type MoveTree = MoveNode[];

const MAX_PLIES_PER_LINE = 600;
const MAX_LINES = 1000;

const moveNodeSchema: z.ZodType<MoveNode> = z.strictObject({
  san: z.string(),
  get children() {
    return z.array(moveNodeSchema);
  },
});

export const moveTreeSchema: z.ZodType<MoveTree> = z
  .array(moveNodeSchema)
  .refine(
    (tree) =>
      mapMoveTreeToLineArray(tree).every(
        (line) => line.length <= MAX_PLIES_PER_LINE,
      ),
    'A move tree line can be at most 600 plies',
  )
  .refine(
    (tree) => mapMoveTreeToLineArray(tree).length <= MAX_LINES,
    'A move tree can have at most 1000 lines',
  );

export function mapMoveTreeToLineArray(tree: MoveTree): string[][] {
  const found: string[][] = [];
  const path: string[] = [];

  const walk = (nodes: MoveNode[]) => {
    for (const node of nodes) {
      path.push(node.san);
      if (node.children.length === 0) found.push([...path]);
      walk(node.children);
      path.pop();
    }
  };

  walk(tree);
  return found;
}
