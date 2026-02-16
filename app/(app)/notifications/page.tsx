import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { NotificationList } from "@/components/notifications/notification-list";
import { Bell } from "lucide-react";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) redirect("/login");

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id, familyId: session.user.familyId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-teal-600" />
          Notifications
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
            : "You're all caught up!"}
        </p>
      </div>

      <NotificationList notifications={notifications} />
    </div>
  );
}
