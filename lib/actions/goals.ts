"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  createGoalSchema,
  updateGoalSchema,
  type CreateGoalInput,
  type UpdateGoalInput,
} from "@/lib/validations/goals";

function isParent(role: string) {
  return role === "PARENT" || role === "SUPER_ADMIN";
}

export async function recalculateGoalProgress(goalId: string) {
  const goal = await db.goal.findUnique({ where: { id: goalId } });
  if (!goal) return;

  const where: Record<string, unknown> = {
    studentId: goal.studentId,
    familyId: goal.familyId,
    status: "COMPLETED",
    completedDate: {
      gte: goal.termStart,
      lte: goal.termEnd,
    },
  };

  if (goal.subjectId) {
    where.subjectId = goal.subjectId;
  }

  const count = await db.assignment.count({ where });

  await db.goal.update({
    where: { id: goalId },
    data: { currentCount: Math.min(count, goal.targetCount) },
  });
}

export async function recalculateGoalsForAssignment(
  studentId: string,
  familyId: string,
  subjectId: string | null
) {
  // Find all active goals that might be affected
  const goals = await db.goal.findMany({
    where: {
      studentId,
      familyId,
      termEnd: { gte: new Date() },
      ...(subjectId ? { OR: [{ subjectId }, { subjectId: null }] } : {}),
    },
  });

  for (const goal of goals) {
    await recalculateGoalProgress(goal.id);
  }

  revalidatePath("/goals");
}

export async function createGoal(values: CreateGoalInput) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId)
    return { error: "Not authenticated" };
  if (!isParent(session.user.role))
    return { error: "Only parents can create goals" };

  const parsed = createGoalSchema.safeParse(values);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message || "Invalid data" };

  const { title, targetCount, studentId, subjectId, termStart, termEnd } = parsed.data;
  const familyId = session.user.familyId;

  // Verify student
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

  const goal = await db.goal.create({
    data: {
      title,
      targetCount,
      studentId,
      subjectId: subjectId || null,
      familyId,
      termStart: new Date(termStart),
      termEnd: new Date(termEnd),
    },
  });

  // Calculate current progress
  await recalculateGoalProgress(goal.id);

  revalidatePath("/goals");
  return { success: true };
}

export async function updateGoal(values: UpdateGoalInput) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId)
    return { error: "Not authenticated" };
  if (!isParent(session.user.role))
    return { error: "Only parents can manage goals" };

  const parsed = updateGoalSchema.safeParse(values);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message || "Invalid data" };

  const { id, title, targetCount, subjectId, termStart, termEnd } = parsed.data;

  const goal = await db.goal.findFirst({
    where: { id, familyId: session.user.familyId },
  });
  if (!goal) return { error: "Goal not found" };

  await db.goal.update({
    where: { id },
    data: {
      title,
      targetCount,
      subjectId: subjectId || null,
      termStart: new Date(termStart),
      termEnd: new Date(termEnd),
    },
  });

  await recalculateGoalProgress(id);

  revalidatePath("/goals");
  return { success: true };
}

export async function deleteGoal(id: string) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId)
    return { error: "Not authenticated" };
  if (!isParent(session.user.role))
    return { error: "Only parents can delete goals" };

  const goal = await db.goal.findFirst({
    where: { id, familyId: session.user.familyId },
  });
  if (!goal) return { error: "Goal not found" };

  await db.goal.delete({ where: { id } });

  revalidatePath("/goals");
  return { success: true };
}
