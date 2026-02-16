import { z } from "zod/v4";

export const createGoalSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  targetCount: z.number().int().min(1, "Target must be at least 1").max(999),
  studentId: z.string().min(1, "Student is required"),
  subjectId: z.string().optional(),
  termStart: z.string().min(1, "Start date is required"),
  termEnd: z.string().min(1, "End date is required"),
});

export const updateGoalSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Title is required").max(200),
  targetCount: z.number().int().min(1).max(999),
  subjectId: z.string().optional(),
  termStart: z.string().min(1),
  termEnd: z.string().min(1),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
