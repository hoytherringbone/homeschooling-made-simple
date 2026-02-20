"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  createAttendanceSchema,
  type CreateAttendanceInput,
  updateAttendanceSchema,
  type UpdateAttendanceInput,
} from "@/lib/validations/attendance";

function isParent(role: string) {
  return role === "PARENT" || role === "SUPER_ADMIN";
}

export async function createAttendanceLog(values: CreateAttendanceInput) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId)
    return { error: "Not authenticated" };
  if (!isParent(session.user.role))
    return { error: "Only parents can log attendance" };

  const parsed = createAttendanceSchema.safeParse(values);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message || "Invalid data" };

  const { date, hoursLogged, studentId, subjectId, notes } = parsed.data;
  const familyId = session.user.familyId;

  // Verify student belongs to family
  const student = await db.student.findFirst({
    where: { id: studentId, familyId },
  });
  if (!student) return { error: "Student not found" };

  // Verify subject if provided
  if (subjectId) {
    const subject = await db.subject.findFirst({
      where: { id: subjectId, familyId },
    });
    if (!subject) return { error: "Subject not found" };
  }

  await db.attendanceLog.create({
    data: {
      date: new Date(date),
      hoursLogged,
      studentId,
      subjectId: subjectId || null,
      familyId,
      notes: notes || null,
    },
  });

  revalidatePath("/attendance");
  return { success: true };
}

export async function updateAttendanceLog(values: UpdateAttendanceInput) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId)
    return { error: "Not authenticated" };
  if (!isParent(session.user.role))
    return { error: "Only parents can edit attendance logs" };

  const parsed = updateAttendanceSchema.safeParse(values);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message || "Invalid data" };

  const { id, date, hoursLogged, studentId, subjectId, notes } = parsed.data;
  const familyId = session.user.familyId;

  const log = await db.attendanceLog.findFirst({
    where: { id, familyId },
  });
  if (!log) return { error: "Log not found" };

  const student = await db.student.findFirst({
    where: { id: studentId, familyId },
  });
  if (!student) return { error: "Student not found" };

  if (subjectId) {
    const subject = await db.subject.findFirst({
      where: { id: subjectId, familyId },
    });
    if (!subject) return { error: "Subject not found" };
  }

  await db.attendanceLog.update({
    where: { id },
    data: {
      date: new Date(date),
      hoursLogged,
      studentId,
      subjectId: subjectId || null,
      notes: notes || null,
    },
  });

  revalidatePath("/attendance");
  return { success: true };
}

export async function deleteAttendanceLog(id: string) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId)
    return { error: "Not authenticated" };
  if (!isParent(session.user.role))
    return { error: "Only parents can delete attendance logs" };

  const log = await db.attendanceLog.findFirst({
    where: { id, familyId: session.user.familyId },
  });
  if (!log) return { error: "Log not found" };

  await db.attendanceLog.delete({ where: { id } });

  revalidatePath("/attendance");
  return { success: true };
}
