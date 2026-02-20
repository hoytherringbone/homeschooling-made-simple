import { z } from "zod/v4";

export const createAttendanceSchema = z.object({
  date: z.string().min(1, "Date is required"),
  hoursLogged: z.number().min(0.25, "Minimum 0.25 hours").max(12, "Maximum 12 hours"),
  studentId: z.string().min(1, "Student is required"),
  subjectId: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>;

export const updateAttendanceSchema = createAttendanceSchema.extend({
  id: z.string().min(1, "Log ID is required"),
});

export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;
