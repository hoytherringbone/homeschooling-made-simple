import { z } from "zod";

export const createTemplateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  subjectId: z.string().optional(),
  estimatedMinutes: z.coerce.number().min(1).max(480).optional(),
});

export const updateTemplateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  subjectId: z.string().optional(),
  estimatedMinutes: z.coerce.number().min(1).max(480).optional(),
});

export type CreateTemplateValues = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateValues = z.infer<typeof updateTemplateSchema>;
