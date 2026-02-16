import { db } from "@/lib/db";

type NotificationInput = {
  type: "ASSIGNMENT_CREATED" | "STATUS_CHANGED" | "COMMENT_ADDED";
  message: string;
  userId: string;
  familyId: string;
  assignmentId?: string;
  actorName: string;
};

export async function createNotification(input: NotificationInput) {
  return db.notification.create({ data: input });
}

export async function createNotifications(inputs: NotificationInput[]) {
  if (inputs.length === 0) return;
  return db.notification.createMany({ data: inputs });
}

export async function getUnreadCount(userId: string, familyId: string) {
  return db.notification.count({
    where: { userId, familyId, read: false },
  });
}
