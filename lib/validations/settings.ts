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
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
}).refine(
  (data) => {
    if (data.email && !data.password) return false;
    if (data.password && !data.email) return false;
    return true;
  },
  { message: "Both email and password are required to create a student login", path: ["email"] }
);

export const resetStudentPasswordSchema = z.object({
  studentId: z.string().min(1),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export type CreateSubjectValues = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectValues = z.infer<typeof updateSubjectSchema>;
export type UpdateFamilyNameValues = z.infer<typeof updateFamilyNameSchema>;
export type UpdateStudentValues = z.infer<typeof updateStudentSchema>;
export type CreateStudentValues = z.infer<typeof createStudentSchema>;
export type ResetStudentPasswordValues = z.infer<typeof resetStudentPasswordSchema>;
