"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ASSIGNMENT_CATEGORIES } from "@/lib/constants";

const validCategories: string[] = ASSIGNMENT_CATEGORIES.map((c) => c.value);

interface WeightInput {
  category: string;
  weight: number;
}

export async function updateSubjectWeights(subjectId: string, weights: WeightInput[]) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) {
    return { error: "Not authenticated" };
  }
  if (session.user.role !== "PARENT" && session.user.role !== "SUPER_ADMIN") {
    return { error: "Only parents can configure weights" };
  }

  // Validate categories
  for (const w of weights) {
    if (!validCategories.includes(w.category)) {
      return { error: `Invalid category: ${w.category}` };
    }
    if (w.weight < 0 || w.weight > 100) {
      return { error: "Weights must be between 0 and 100" };
    }
  }

  // Validate sum = 100
  const sum = weights.reduce((s, w) => s + w.weight, 0);
  if (Math.round(sum) !== 100) {
    return { error: "Weights must add up to 100%" };
  }

  // Verify subject belongs to this family
  const subject = await db.subject.findFirst({
    where: { id: subjectId, familyId: session.user.familyId },
  });
  if (!subject) {
    return { error: "Subject not found" };
  }

  // Upsert all weights in a transaction
  await db.$transaction(
    weights.map((w) =>
      db.subjectWeight.upsert({
        where: { subjectId_category: { subjectId, category: w.category } },
        create: { subjectId, category: w.category, weight: w.weight },
        update: { weight: w.weight },
      })
    )
  );

  revalidatePath(`/subjects/${subjectId}`);
  revalidatePath("/reports/progress");
  return { success: true };
}
