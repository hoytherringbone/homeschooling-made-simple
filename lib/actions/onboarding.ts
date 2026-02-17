"use server";

import { db } from "@/lib/db";
import { auth, signIn } from "@/lib/auth";
import { studentsStepSchema, subjectsStepSchema } from "@/lib/validations/onboarding";
import { z } from "zod";
import bcrypt from "bcryptjs";

export async function createStudents(
  familyId: string,
  students: z.infer<typeof studentsStepSchema>["students"],
) {
  const parsed = studentsStepSchema.safeParse({ students });
  if (!parsed.success) {
    return { error: "Invalid student data" };
  }

  const emails = parsed.data.students
    .map((s) => s.email)
    .filter((e): e is string => !!e && e !== "");

  if (emails.length > 0) {
    const uniqueEmails = new Set(emails);
    if (uniqueEmails.size !== emails.length) {
      return { error: "Duplicate email addresses found" };
    }

    const existingUsers = await db.user.findMany({
      where: { email: { in: emails } },
      select: { email: true },
    });
    if (existingUsers.length > 0) {
      return { error: `Email already in use: ${existingUsers[0].email}` };
    }
  }

  let createdCount = 0;

  for (const s of parsed.data.students) {
    let userId: string | undefined;

    if (s.email && s.password) {
      const hashedPassword = await bcrypt.hash(s.password, 10);
      const user = await db.user.create({
        data: {
          email: s.email,
          name: s.name,
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
        name: s.name,
        gradeLevel: s.gradeLevel,
        familyId,
        ...(userId && { userId }),
      },
    });
    createdCount++;
  }

  return { success: true, count: createdCount };
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
