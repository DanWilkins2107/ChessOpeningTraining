// fallow-ignore-file unused-file -- ef93ff81 2026-11-16 landed ahead of the folder page, its first consumer.
export type MoveNode = {
  san: string;
  children: MoveNode[];
  confidence?: number;
};
