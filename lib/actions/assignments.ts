"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { VALID_TRANSITIONS } from "@/lib/constants";
import { recalculateGoalsForAssignment } from "@/lib/actions/goals";
import { createNotification, createNotifications } from "@/lib/notifications";
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  statusTransitionSchema,
  createCommentSchema,
  importRowSchema,
  type CreateAssignmentValues,
  type UpdateAssignmentValues,
  type StatusTransitionValues,
  type CreateCommentValues,
  type ImportRowValues,
} from "@/lib/validations/assignments";

export async function createAssignment(values: CreateAssignmentValues) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) {
    return { error: "Not authenticated" };
  }
  if (session.user.role !== "PARENT" && session.user.role !== "SUPER_ADMIN") {
    return { error: "Only parents can create assignments" };
  }

  const parsed = createAssignmentSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid data" };
  }

  const { title, description, studentIds, subjectId, category, priority, dueDate, estimatedMinutes, templateId } = parsed.data;
  const familyId = session.user.familyId;

  // Verify all students belong to this family
  const students = await db.student.findMany({
    where: { id: { in: studentIds }, familyId },
    select: { id: true },
  });
  if (students.length !== studentIds.length) {
    return { error: "Invalid student selection" };
  }

  // Verify subject belongs to this family (if provided)
  if (subjectId) {
    const subject = await db.subject.findFirst({
      where: { id: subjectId, familyId },
    });
    if (!subject) return { error: "Invalid subject" };
  }

  // Create one assignment per student
  const assignments = await db.$transaction(
    studentIds.map((studentId) =>
      db.assignment.create({
        data: {
          title,
          description: description || null,
          status: "ASSIGNED",
          priority,
          dueDate: dueDate ? new Date(dueDate) : null,
          estimatedMinutes: estimatedMinutes || null,
          studentId,
          subjectId: subjectId || null,
          category: category || null,
          familyId,
          templateId: templateId || null,
        },
      }),
    ),
  );

  // Log activity for each assignment
  await db.activityLog.createMany({
    data: assignments.map((a) => ({
      action: "CREATED",
      details: `Assignment "${title}" created`,
      performedBy: session.user.id,
      performedByName: session.user.name || "Unknown",
      assignmentId: a.id,
    })),
  });

  // Notify assigned students
  const studentUsers = await db.student.findMany({
    where: { id: { in: studentIds }, familyId, userId: { not: null } },
    select: { id: true, userId: true },
  });
  const userIdByStudentId = Object.fromEntries(
    studentUsers.filter((s) => s.userId).map((s) => [s.id, s.userId])
  );
  await createNotifications(
    assignments
      .filter((a) => userIdByStudentId[a.studentId])
      .map((a) => ({
        type: "ASSIGNMENT_CREATED" as const,
        message: `New assignment: "${a.title}"`,
        userId: userIdByStudentId[a.studentId]!,
        familyId,
        assignmentId: a.id,
        actorName: session.user.name || "Parent",
      }))
  );

  revalidatePath("/assignments");
  revalidatePath("/dashboard");
  revalidatePath("/notifications");

  return { success: true, count: assignments.length };
}

export async function updateAssignment(values: UpdateAssignmentValues) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) {
    return { error: "Not authenticated" };
  }
  if (session.user.role !== "PARENT" && session.user.role !== "SUPER_ADMIN") {
    return { error: "Only parents can edit assignments" };
  }

  const parsed = updateAssignmentSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid data" };
  }

  const { assignmentId, title, description, studentId, subjectId, category, priority, dueDate, estimatedMinutes } = parsed.data;
  const familyId = session.user.familyId;

  // Verify assignment belongs to this family
  const assignment = await db.assignment.findFirst({
    where: { id: assignmentId, familyId },
  });
  if (!assignment) return { error: "Assignment not found" };

  // Verify student belongs to this family
  const student = await db.student.findFirst({
    where: { id: studentId, familyId },
  });
  if (!student) return { error: "Invalid student" };

  // Verify subject belongs to this family (if provided)
  if (subjectId) {
    const subject = await db.subject.findFirst({
      where: { id: subjectId, familyId },
    });
    if (!subject) return { error: "Invalid subject" };
  }

  await db.assignment.update({
    where: { id: assignmentId },
    data: {
      title,
      description: description || null,
      studentId,
      subjectId: subjectId || null,
      category: category || null,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      estimatedMinutes: estimatedMinutes || null,
    },
  });

  await db.activityLog.create({
    data: {
      action: "UPDATED",
      details: `Assignment "${title}" updated`,
      performedBy: session.user.id,
      performedByName: session.user.name || "Unknown",
      assignmentId,
    },
  });

  revalidatePath("/assignments");
  revalidatePath(`/assignments/${assignmentId}`);
  revalidatePath("/dashboard");

  return { success: true };
}

export async function updateAssignmentStatus(values: StatusTransitionValues) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) {
    return { error: "Not authenticated" };
  }

  const parsed = statusTransitionSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid data" };
  }

  const { assignmentId, newStatus, comment, gradeLabel, gradeValue } = parsed.data;

  // Fetch the assignment and verify ownership
  const assignment = await db.assignment.findFirst({
    where: { id: assignmentId, familyId: session.user.familyId },
    include: { student: true },
  });
  if (!assignment) return { error: "Assignment not found" };

  // Validate the transition
  const transition = VALID_TRANSITIONS[assignment.status];
  if (!transition) return { error: "Invalid current status" };

  const userRole = session.user.role;
  if (!transition.roles.includes(userRole)) {
    return { error: "You don't have permission for this action" };
  }
  if (!transition.to.includes(newStatus)) {
    return { error: `Cannot change from ${assignment.status} to ${newStatus}` };
  }

  // For student actions, verify they own this assignment
  if (userRole === "STUDENT") {
    const studentProfile = await db.student.findUnique({
      where: { userId: session.user.id },
    });
    if (!studentProfile || studentProfile.id !== assignment.studentId) {
      return { error: "This is not your assignment" };
    }
  }

  // Build the update data
  const updateData: Record<string, unknown> = { status: newStatus };
  if (newStatus === "COMPLETED") {
    updateData.completedDate = new Date();
    if (gradeLabel !== undefined) updateData.gradeLabel = gradeLabel;
    if (gradeValue !== undefined) updateData.gradeValue = gradeValue;
  }
  if (newStatus === "ASSIGNED") {
    updateData.completedDate = null;
  }

  await db.assignment.update({
    where: { id: assignmentId },
    data: updateData,
  });

  // Create mandatory comment when returning to ASSIGNED
  if (newStatus === "ASSIGNED" && comment) {
    await db.comment.create({
      data: {
        content: comment,
        authorId: session.user.id,
        authorName: session.user.name || "Unknown",
        authorRole: session.user.role,
        assignmentId,
      },
    });
  }

  // Log the activity
  await db.activityLog.create({
    data: {
      action: "STATUS_CHANGED",
      details: `${assignment.status} → ${newStatus}`,
      performedBy: session.user.id,
      performedByName: session.user.name || "Unknown",
      assignmentId,
    },
  });

  // Recalculate goal progress when completing or un-completing
  if (newStatus === "COMPLETED" || assignment.status === "COMPLETED") {
    await recalculateGoalsForAssignment(
      assignment.studentId,
      session.user.familyId,
      assignment.subjectId
    );
  }

  // Create notifications
  if (newStatus === "COMPLETED" && userRole === "STUDENT") {
    // Student submitted → notify parent(s)
    const parents = await db.user.findMany({
      where: { familyId: session.user.familyId, role: "PARENT" },
      select: { id: true },
    });
    await createNotifications(
      parents.map((p) => ({
        type: "STATUS_CHANGED" as const,
        message: `${session.user.name} submitted "${assignment.title}"`,
        userId: p.id,
        familyId: session.user.familyId,
        assignmentId,
        actorName: session.user.name || "Student",
      }))
    );
  } else if (newStatus === "ASSIGNED" && (userRole === "PARENT" || userRole === "SUPER_ADMIN")) {
    // Parent returned → notify the student
    const student = await db.student.findUnique({
      where: { id: assignment.studentId },
      select: { userId: true },
    });
    if (student?.userId) {
      await createNotification({
        type: "STATUS_CHANGED",
        message: `${session.user.name} returned "${assignment.title}"`,
        userId: student.userId,
        familyId: session.user.familyId,
        assignmentId,
        actorName: session.user.name || "Parent",
      });
    }
  }

  revalidatePath("/assignments");
  revalidatePath(`/assignments/${assignmentId}`);
  revalidatePath("/dashboard");
  revalidatePath("/notifications");

  return { success: true };
}

export async function addComment(values: CreateCommentValues) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) {
    return { error: "Not authenticated" };
  }

  const parsed = createCommentSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid data" };
  }

  const { assignmentId, content } = parsed.data;

  // Verify assignment belongs to family
  const assignment = await db.assignment.findFirst({
    where: { id: assignmentId, familyId: session.user.familyId },
  });
  if (!assignment) return { error: "Assignment not found" };

  await db.comment.create({
    data: {
      content,
      authorId: session.user.id,
      authorName: session.user.name || "Unknown",
      authorRole: session.user.role,
      assignmentId,
    },
  });

  await db.activityLog.create({
    data: {
      action: "COMMENT_ADDED",
      details: `Comment added`,
      performedBy: session.user.id,
      performedByName: session.user.name || "Unknown",
      assignmentId,
    },
  });

  // Notify the other party
  if (session.user.role === "PARENT" || session.user.role === "SUPER_ADMIN") {
    // Parent commented → notify the student
    const student = await db.student.findFirst({
      where: { id: assignment.studentId },
      select: { userId: true },
    });
    if (student?.userId) {
      await createNotification({
        type: "COMMENT_ADDED",
        message: `${session.user.name} commented on "${assignment.title}"`,
        userId: student.userId,
        familyId: session.user.familyId,
        assignmentId,
        actorName: session.user.name || "Parent",
      });
    }
  } else {
    // Student commented → notify all parents
    const parents = await db.user.findMany({
      where: { familyId: session.user.familyId, role: "PARENT" },
      select: { id: true },
    });
    await createNotifications(
      parents.map((p) => ({
        type: "COMMENT_ADDED" as const,
        message: `${session.user.name} commented on "${assignment.title}"`,
        userId: p.id,
        familyId: session.user.familyId,
        assignmentId,
        actorName: session.user.name || "Student",
      }))
    );
  }

  revalidatePath(`/assignments/${assignmentId}`);
  revalidatePath("/notifications");

  return { success: true };
}

export async function deleteAssignment(assignmentId: string) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) {
    return { error: "Not authenticated" };
  }
  if (session.user.role !== "PARENT" && session.user.role !== "SUPER_ADMIN") {
    return { error: "Only parents can delete assignments" };
  }

  const assignment = await db.assignment.findFirst({
    where: { id: assignmentId, familyId: session.user.familyId },
  });
  if (!assignment) return { error: "Assignment not found" };

  await db.assignment.delete({ where: { id: assignmentId } });

  revalidatePath("/assignments");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function bulkCreateAssignments(rows: ImportRowValues[]) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) {
    return { error: "Not authenticated" };
  }
  if (session.user.role !== "PARENT" && session.user.role !== "SUPER_ADMIN") {
    return { error: "Only parents can import assignments" };
  }

  const familyId = session.user.familyId;

  // Load students and subjects for name matching
  const [students, subjects] = await Promise.all([
    db.student.findMany({ where: { familyId }, select: { id: true, name: true } }),
    db.subject.findMany({ where: { familyId }, select: { id: true, name: true } }),
  ]);

  const studentByName = new Map(students.map((s) => [s.name.toLowerCase(), s.id]));
  const subjectByName = new Map(subjects.map((s) => [s.name.toLowerCase(), s.id]));

  const errors: string[] = [];
  const toCreate: Array<{
    title: string;
    description: string | null;
    status: string;
    priority: string;
    dueDate: Date | null;
    estimatedMinutes: number | null;
    studentId: string;
    subjectId: string | null;
    familyId: string;
  }> = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const parsed = importRowSchema.safeParse(row);
    if (!parsed.success) {
      errors.push(`Row ${i + 1}: ${parsed.error.issues[0]?.message}`);
      continue;
    }

    const studentId = studentByName.get(parsed.data.studentName.toLowerCase());
    if (!studentId) {
      errors.push(`Row ${i + 1}: Student "${parsed.data.studentName}" not found`);
      continue;
    }

    const subjectId = parsed.data.subjectName
      ? subjectByName.get(parsed.data.subjectName.toLowerCase()) || null
      : null;

    if (parsed.data.subjectName && !subjectId) {
      errors.push(`Row ${i + 1}: Subject "${parsed.data.subjectName}" not found`);
      continue;
    }

    let dueDate: Date | null = null;
    if (parsed.data.dueDate) {
      const d = new Date(parsed.data.dueDate);
      if (isNaN(d.getTime())) {
        errors.push(`Row ${i + 1}: Invalid date "${parsed.data.dueDate}"`);
        continue;
      }
      dueDate = d;
    }

    toCreate.push({
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: "ASSIGNED",
      priority: parsed.data.priority,
      dueDate,
      estimatedMinutes: parsed.data.estimatedMinutes || null,
      studentId,
      subjectId,
      familyId,
    });
  }

  if (errors.length > 0) {
    return { error: errors.join("\n"), errors };
  }

  await db.$transaction(
    toCreate.map((data) => db.assignment.create({ data }))
  );

  revalidatePath("/assignments");
  revalidatePath("/dashboard");

  return { success: true, count: toCreate.length };
}
