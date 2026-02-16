"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markAsRead, markAllAsRead } from "@/lib/actions/notifications";
import {
  Bell,
  ClipboardList,
  ArrowRightLeft,
  MessageSquare,
  CheckCheck,
} from "lucide-react";

type Notification = {
  id: string;
  type: string;
  message: string;
  read: boolean;
  actorName: string;
  assignmentId: string | null;
  createdAt: Date;
};

const typeIcons: Record<string, typeof ClipboardList> = {
  ASSIGNMENT_CREATED: ClipboardList,
  STATUS_CHANGED: ArrowRightLeft,
  COMMENT_ADDED: MessageSquare,
};

const typeColors: Record<string, string> = {
  ASSIGNMENT_CREATED: "text-blue-600 bg-blue-50",
  STATUS_CHANGED: "text-teal-600 bg-teal-50",
  COMMENT_ADDED: "text-purple-600 bg-purple-50",
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export function NotificationList({
  notifications,
}: {
  notifications: Notification[];
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const hasUnread = notifications.some((n) => !n.read);

  function handleClick(notification: Notification) {
    startTransition(async () => {
      if (!notification.read) {
        await markAsRead(notification.id);
      }
      if (notification.assignmentId) {
        router.push(`/assignments/${notification.assignmentId}`);
      }
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllAsRead();
    });
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#EDE9E3] p-10 text-center">
        <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">No notifications yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hasUnread && (
        <div className="flex justify-end">
          <button
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors disabled:opacity-50"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all as read
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#EDE9E3] divide-y divide-[#EDE9E3] overflow-hidden">
        {notifications.map((n) => {
          const Icon = typeIcons[n.type] || ClipboardList;
          const colors = typeColors[n.type] || "text-slate-600 bg-slate-50";

          return (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              disabled={isPending}
              className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 disabled:opacity-50 ${
                !n.read ? "bg-teal-50/40" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${colors}`}
              >
                <Icon className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm leading-snug ${
                    !n.read
                      ? "font-medium text-slate-900"
                      : "text-slate-600"
                  }`}
                >
                  {n.message}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {timeAgo(n.createdAt)}
                </p>
              </div>
              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-teal-600 shrink-0 mt-2" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

