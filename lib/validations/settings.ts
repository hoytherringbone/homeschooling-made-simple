import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color").optional(),
});

export const updateSubjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Name is required").max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color").optional(),
});

export const updateFamilyNameSchema = z.object({
  name: z.string().min(1, "Family name is required").max(100),
});

export const updateStudentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Name is required").max(100),
  gradeLevel: z.string().max(20).optional(),
});

export const createStudentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  gradeLevel: z.string().max(20).optional(),
});

export type CreateSubjectValues = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectValues = z.infer<typeof updateSubjectSchema>;
export type UpdateFamilyNameValues = z.infer<typeof updateFamilyNameSchema>;
export type UpdateStudentValues = z.infer<typeof updateStudentSchema>;
export type CreateStudentValues = z.infer<typeof createStudentSchema>;
