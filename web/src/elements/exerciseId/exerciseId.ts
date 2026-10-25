// fallow-ignore-file unused-file -- c5bbb354 2026-11-24 landed ahead of the line picker (c42b3cac), its first consumer.
import type { Exercise } from '../Exercise/Exercise';

// SANs never contain spaces, so the joined path is unambiguous.
export const exerciseId = ({ type, side, path }: Exercise) =>
  `${type}:${side}:${path.join(' ')}`;
