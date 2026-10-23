import { z } from 'npm:zod@4.5.4';

const DAY_MS = 86_400_000;

// The client sends its local date, and every timezone's date is within a day of UTC's.
const isWithinADayOfToday = (day: string) =>
  Math.abs(
    Date.parse(day) - Date.parse(new Date().toISOString().slice(0, 10)),
  ) <= DAY_MS;

export const trainingRequestSchema = z
  .object({
    treeIds: z.array(z.uuid()).min(1).max(500),
    path: z.array(z.string()).min(1).max(600),
    confidenceChanges: z.array(z.int().min(-5).max(5)),
    day: z.iso
      .date()
      .refine(isWithinADayOfToday, 'Day must be within a day of today'),
  })
  .refine(
    (training) => training.confidenceChanges.length === training.path.length,
    'Every move on the path needs a confidence change',
  );

export type TrainingRequest = z.infer<typeof trainingRequestSchema>;
