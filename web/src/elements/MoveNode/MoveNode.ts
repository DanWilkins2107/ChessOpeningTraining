// fallow-ignore-file unused-file -- ef93ff81 2026-12-14 landed ahead of the move tree board + title (e62ad75f), its first consumer.
export type MoveNode = {
  san: string;
  children: MoveNode[];
  confidence?: number;
};
