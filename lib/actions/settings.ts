"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import {
  createSubjectSchema,
  updateSubjectSchema,
  updateFamilyNameSchema,
  updateStudentSchema,
  createStudentSchema,
  resetStudentPasswordSchema,
  createStudentLoginSchema,
  type CreateSubjectValues,
  type UpdateSubjectValues,
  type UpdateFamilyNameValues,
  type UpdateStudentValues,
  type CreateStudentValues,
  type ResetStudentPasswordValues,
  type CreateStudentLoginValues,
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

  const { name, gradeLevel, email, password } = parsed.data;
  const familyId = session.user.familyId;

  let userId: string | undefined;

  if (email && password) {
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) return { error: "An account with this email already exists" };

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: {
        email,
        name,
        hashedPassword,
        role: "STUDENT",
        familyId,
        onboarded: true,
      },
    });
    userId = user.id;
  }

  await db.student.create({
    data: {
      name,
      gradeLevel: gradeLevel || null,
      familyId,
      ...(userId && { userId }),
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

// --- Reset Student Password ---

export async function resetStudentPassword(values: ResetStudentPasswordValues) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) return { error: "Not authenticated" };
  if (!isParent(session.user.role)) return { error: "Only parents or admins can reset passwords" };

  const parsed = resetStudentPasswordSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid data" };

  const { studentId, newPassword } = parsed.data;

  const whereClause = session.user.role === "SUPER_ADMIN"
    ? { id: studentId }
    : { id: studentId, familyId: session.user.familyId };

  const student = await db.student.findFirst({
    where: whereClause,
    include: { user: true },
  });

  if (!student) return { error: "Student not found" };
  if (!student.userId || !student.user) return { error: "This student doesn't have a login account" };

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db.user.update({
    where: { id: student.userId },
    data: { hashedPassword },
  });

  return { success: true };
}

// --- Create Login for Existing Student ---

export async function createStudentLogin(values: CreateStudentLoginValues) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) return { error: "Not authenticated" };
  if (!isParent(session.user.role)) return { error: "Only parents can manage students" };

  const parsed = createStudentLoginSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid data" };

  const { studentId, email, password } = parsed.data;
  const familyId = session.user.familyId;

  const student = await db.student.findFirst({
    where: { id: studentId, familyId },
  });
  if (!student) return { error: "Student not found" };
  if (student.userId) return { error: "This student already has a login account" };

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) return { error: "An account with this email already exists" };

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: {
      email,
      name: student.name,
      hashedPassword,
      role: "STUDENT",
      familyId,
      onboarded: true,
    },
  });

  await db.student.update({
    where: { id: studentId },
    data: { userId: user.id },
  });

  revalidatePath("/settings");
  return { success: true };
}
