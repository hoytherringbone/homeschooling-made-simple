"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  createTemplateSchema,
  updateTemplateSchema,
  type CreateTemplateValues,
  type UpdateTemplateValues,
} from "@/lib/validations/templates";

export async function createTemplate(values: CreateTemplateValues) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) {
    return { error: "Not authenticated" };
  }
  if (session.user.role !== "PARENT" && session.user.role !== "SUPER_ADMIN") {
    return { error: "Only parents can create templates" };
  }

  const parsed = createTemplateSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid data" };
  }

  const { title, description, subjectId, estimatedMinutes } = parsed.data;
  const familyId = session.user.familyId;

  if (subjectId) {
    const subject = await db.subject.findFirst({ where: { id: subjectId, familyId } });
    if (!subject) return { error: "Invalid subject" };
  }

  await db.assignmentTemplate.create({
    data: {
      title,
      description: description || null,
      subjectId: subjectId || null,
      estimatedMinutes: estimatedMinutes || null,
      familyId,
    },
  });

  revalidatePath("/templates");

  return { success: true };
}

export async function updateTemplate(values: UpdateTemplateValues) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) {
    return { error: "Not authenticated" };
  }
  if (session.user.role !== "PARENT" && session.user.role !== "SUPER_ADMIN") {
    return { error: "Only parents can edit templates" };
  }

  const parsed = updateTemplateSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid data" };
  }

  const { id, ...data } = parsed.data;

  const template = await db.assignmentTemplate.findFirst({
    where: { id, familyId: session.user.familyId },
  });
  if (!template) return { error: "Template not found" };

  await db.assignmentTemplate.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.subjectId !== undefined && { subjectId: data.subjectId || null }),
      ...(data.estimatedMinutes !== undefined && { estimatedMinutes: data.estimatedMinutes || null }),
    },
  });

  revalidatePath("/templates");

  return { success: true };
}

export async function deleteTemplate(templateId: string) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) {
    return { error: "Not authenticated" };
  }
  if (session.user.role !== "PARENT" && session.user.role !== "SUPER_ADMIN") {
    return { error: "Only parents can delete templates" };
  }

  const template = await db.assignmentTemplate.findFirst({
    where: { id: templateId, familyId: session.user.familyId },
  });
  if (!template) return { error: "Template not found" };

  await db.assignmentTemplate.delete({ where: { id: templateId } });

  revalidatePath("/templates");

  return { success: true };
}
