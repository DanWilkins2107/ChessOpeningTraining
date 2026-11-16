// fallow-ignore-file unused-file -- 74a47fb0 2026-12-14 landed ahead of the line picker (cbef563b), its first consumer.
import type { ChosenMoveTree } from '../ChosenMoveTree/ChosenMoveTree';
import { enumerateLines } from '../enumerateLines/enumerateLines';
import { enumerateOtherColour } from '../enumerateOtherColour/enumerateOtherColour';
import { enumerateSplits } from '../enumerateSplits/enumerateSplits';
import type { Exercise } from '../Exercise/Exercise';
import type { ExerciseStatus } from '../ExerciseStatus/ExerciseStatus';
import { lineStatus } from '../lineStatus/lineStatus';
import type { MoveNode } from '../MoveNode/MoveNode';
import { otherColourStatus } from '../otherColourStatus/otherColourStatus';
import { splitStatus } from '../splitStatus/splitStatus';

type Trees = Record<ChosenMoveTree['side'], MoveNode[]>;

// Statuses come fresh from the confidences on every call, so nothing is stored
// and a scoring update just means deriving again.
export const deriveExercises = (
  trees: Trees,
): (Exercise & { status: ExerciseStatus })[] =>
  (['white', 'black'] as const).flatMap((side) => [
    ...enumerateLines(side, trees[side]).map((exercise) => ({
      ...exercise,
      status: lineStatus(side, trees[side], exercise.path),
    })),
    ...enumerateSplits(side, trees[side]).map((exercise) => ({
      ...exercise,
      status: splitStatus(side, trees[side], exercise.path),
    })),
    ...enumerateOtherColour(side, trees[side]).map((exercise) => ({
      ...exercise,
      status: otherColourStatus(side, trees, exercise.path),
    })),
  ]);
