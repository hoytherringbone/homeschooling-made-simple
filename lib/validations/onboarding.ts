import { z } from "zod";

export const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  gradeLevel: z.string().min(1, "Grade level is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
});

export const studentsStepSchema = z.object({
  students: z.array(studentSchema).min(1, "Add at least one student"),
});

export const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  color: z.string(),
});

export const subjectsStepSchema = z.object({
  subjects: z.array(subjectSchema).min(1, "Select at least one subject"),
});

export type StudentInput = z.infer<typeof studentSchema>;
export type SubjectInput = z.infer<typeof subjectSchema>;
