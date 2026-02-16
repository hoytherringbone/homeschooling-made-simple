"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  createSubjectSchema,
  updateSubjectSchema,
  updateFamilyNameSchema,
  updateStudentSchema,
  createStudentSchema,
  type CreateSubjectValues,
  type UpdateSubjectValues,
  type UpdateFamilyNameValues,
  type UpdateStudentValues,
  type CreateStudentValues,
} from "@/lib/validations/settings";
import { SUBJECT_COLORS } from "@/lib/constants";

function isParent(role: string) {
  return role === "PARENT" || role === "SUPER_ADMIN";
}

// --- Subjects ---

export async function createSubject(values: CreateSubjectValues) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) return { error: "Not authenticated" };
  if (!isParent(session.user.role)) return { error: "Only parents can manage subjects" };

  const parsed = createSubjectSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid data" };

  const { name, color } = parsed.data;
  const familyId = session.user.familyId;

  // Pick a default color if none provided
  const existingCount = await db.subject.count({ where: { familyId } });
  const defaultColor = SUBJECT_COLORS[existingCount % SUBJECT_COLORS.length];

  await db.subject.create({
    data: {
      name,
      color: color || defaultColor,
      familyId,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/assignments");
  return { success: true };
}

export async function updateSubject(values: UpdateSubjectValues) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) return { error: "Not authenticated" };
  if (!isParent(session.user.role)) return { error: "Only parents can manage subjects" };

  const parsed = updateSubjectSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid data" };

  const { id, name, color } = parsed.data;

  const subject = await db.subject.findFirst({
    where: { id, familyId: session.user.familyId },
  });
  if (!subject) return { error: "Subject not found" };

  await db.subject.update({
    where: { id },
    data: { name, ...(color !== undefined && { color }) },
  });

  revalidatePath("/settings");
  revalidatePath("/assignments");
  return { success: true };
}

export async function deleteSubject(subjectId: string) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) return { error: "Not authenticated" };
  if (!isParent(session.user.role)) return { error: "Only parents can manage subjects" };

  const subject = await db.subject.findFirst({
    where: { id: subjectId, familyId: session.user.familyId },
  });
  if (!subject) return { error: "Subject not found" };

  // Check for assignments using this subject
  const assignmentCount = await db.assignment.count({ where: { subjectId } });
  if (assignmentCount > 0) {
    return { error: `Cannot delete — ${assignmentCount} assignment${assignmentCount > 1 ? "s" : ""} use this subject` };
  }

  await db.subject.delete({ where: { id: subjectId } });

  revalidatePath("/settings");
  return { success: true };
}

// --- Family ---

export async function updateFamilyName(values: UpdateFamilyNameValues) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) return { error: "Not authenticated" };
  if (!isParent(session.user.role)) return { error: "Only parents can update family settings" };

  const parsed = updateFamilyNameSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid data" };

  await db.family.update({
    where: { id: session.user.familyId },
    data: { name: parsed.data.name },
  });

  revalidatePath("/settings");
  return { success: true };
}

// --- Students ---

export async function createStudent(values: CreateStudentValues) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) return { error: "Not authenticated" };
  if (!isParent(session.user.role)) return { error: "Only parents can manage students" };

  const parsed = createStudentSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid data" };

  await db.student.create({
    data: {
      name: parsed.data.name,
      gradeLevel: parsed.data.gradeLevel || null,
      familyId: session.user.familyId,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/students");
  return { success: true };
}

export async function updateStudent(values: UpdateStudentValues) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) return { error: "Not authenticated" };
  if (!isParent(session.user.role)) return { error: "Only parents can manage students" };

  const parsed = updateStudentSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid data" };

  const { id, name, gradeLevel } = parsed.data;

  const student = await db.student.findFirst({
    where: { id, familyId: session.user.familyId },
  });
  if (!student) return { error: "Student not found" };

  await db.student.update({
    where: { id },
    data: { name, gradeLevel: gradeLevel || null },
  });

  revalidatePath("/settings");
  revalidatePath("/students");
  return { success: true };
}

export async function deleteStudent(studentId: string) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) return { error: "Not authenticated" };
  if (!isParent(session.user.role)) return { error: "Only parents can manage students" };

  const student = await db.student.findFirst({
    where: { id: studentId, familyId: session.user.familyId },
  });
  if (!student) return { error: "Student not found" };

  const assignmentCount = await db.assignment.count({ where: { studentId } });
  if (assignmentCount > 0) {
    return { error: `Cannot delete — ${assignmentCount} assignment${assignmentCount > 1 ? "s" : ""} exist for this student` };
  }

  await db.student.delete({ where: { id: studentId } });

  revalidatePath("/settings");
  revalidatePath("/students");
  return { success: true };
}
