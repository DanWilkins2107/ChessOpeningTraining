// fallow-ignore-file unused-file -- 1c3bb1b3 2026-11-29 landed ahead of deriveExercises (74a47fb0), its first consumer.
import type { ChosenMoveTree } from '../ChosenMoveTree/ChosenMoveTree';
import type { Exercise } from '../Exercise/Exercise';
import { mapMovesToLineArray } from '../mapMovesToLineArray/mapMovesToLineArray';
import type { MoveNode } from '../MoveNode/MoveNode';

// White plays the even path indexes, black the odd ones. A path needs one of
// your moves to be worth testing, so a black tree that is just 1.e4 has none.
export const enumerateLines = (
  side: ChosenMoveTree['side'],
  tree: MoveNode[],
): Exercise[] => {
  const firstOwnIndex = side === 'white' ? 0 : 1;
  return mapMovesToLineArray(tree)
    .filter((path) => path.length > firstOwnIndex)
    .map((path) => ({ type: 'line', side, path }));
};
