// fallow-ignore-file unused-file -- landed ahead of deriveExercises, its first consumer.
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
