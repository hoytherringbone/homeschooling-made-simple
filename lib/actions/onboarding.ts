"use server";

import { db } from "@/lib/db";
import { auth, signIn } from "@/lib/auth";
import { studentsStepSchema, subjectsStepSchema } from "@/lib/validations/onboarding";
import { z } from "zod";

export async function createStudents(
  familyId: string,
  students: z.infer<typeof studentsStepSchema>["students"],
) {
  const parsed = studentsStepSchema.safeParse({ students });
  if (!parsed.success) {
    return { error: "Invalid student data" };
  }

  const created = await db.student.createManyAndReturn({
    data: parsed.data.students.map((s) => ({
      name: s.name,
      gradeLevel: s.gradeLevel,
      familyId,
    })),
  });

  return { success: true, count: created.length };
}

export async function createSubjects(
  familyId: string,
  subjects: z.infer<typeof subjectsStepSchema>["subjects"],
) {
  const parsed = subjectsStepSchema.safeParse({ subjects });
  if (!parsed.success) {
    return { error: "Invalid subject data" };
  }

  const created = await db.subject.createManyAndReturn({
    data: parsed.data.subjects.map((s) => ({
      name: s.name,
      color: s.color,
      familyId,
    })),
  });

  return { success: true, count: created.length };
}

export async function completeOnboarding() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { onboarded: true },
  });

  return { success: true };
}
