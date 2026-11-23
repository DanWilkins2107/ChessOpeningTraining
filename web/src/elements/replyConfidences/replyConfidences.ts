// fallow-ignore-file unused-file -- cbef563b 2026-12-21 split out of the exercise statuses, unused until the training session (aaf71c83).
import { findMoveNode } from '../findMoveNode/findMoveNode';
import type { MoveNode } from '../MoveNode/MoveNode';

// The confidences of every reply to the move the path ends on. None when the
// path is missing from the tree.
export const replyConfidences = (tree: MoveNode[], path: string[]): number[] =>
  (findMoveNode(tree, path)?.children ?? []).map(
    (reply) => reply.confidence ?? 0,
  );
