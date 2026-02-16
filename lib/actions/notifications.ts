"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function markAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) {
    return { error: "Not authenticated" };
  }

  await db.notification.updateMany({
    where: {
      id: notificationId,
      userId: session.user.id,
      familyId: session.user.familyId,
    },
    data: { read: true },
  });

  revalidatePath("/notifications");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function markAllAsRead() {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) {
    return { error: "Not authenticated" };
  }

  await db.notification.updateMany({
    where: {
      userId: session.user.id,
      familyId: session.user.familyId,
      read: false,
    },
    data: { read: true },
  });

  revalidatePath("/notifications");
  revalidatePath("/", "layout");
  return { success: true };
}
