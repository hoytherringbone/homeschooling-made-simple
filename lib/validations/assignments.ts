import { z } from "zod";

export const createAssignmentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  studentIds: z.array(z.string()).min(1, "Select at least one student"),
  subjectId: z.string().optional(),
  category: z.enum(["TEST", "QUIZ", "HOMEWORK", "PROJECT"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.string().optional(), // ISO date string from form
  estimatedMinutes: z.coerce.number().min(1).max(480).optional(),
  templateId: z.string().optional(),
});

export const statusTransitionSchema = z
  .object({
    assignmentId: z.string().min(1),
    newStatus: z.enum(["ASSIGNED", "COMPLETED"]),
    comment: z.string().max(2000).optional(),
    gradeLabel: z.string().optional(),
    gradeValue: z.number().optional(),
  })
  .refine(
    (data) => data.newStatus !== "ASSIGNED" || (data.comment && data.comment.trim().length > 0),
    { message: "Feedback is required when returning an assignment", path: ["comment"] },
  );

export const createCommentSchema = z.object({
  assignmentId: z.string().min(1),
  content: z.string().min(1, "Comment cannot be empty").max(2000),
});

export const importRowSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  studentName: z.string().min(1, "Student name is required"),
  subjectName: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  estimatedMinutes: z.coerce.number().min(1).max(480).optional(),
});

export type CreateAssignmentValues = z.infer<typeof createAssignmentSchema>;
export type StatusTransitionValues = z.infer<typeof statusTransitionSchema>;
export type CreateCommentValues = z.infer<typeof createCommentSchema>;
export type ImportRowValues = z.infer<typeof importRowSchema>;
