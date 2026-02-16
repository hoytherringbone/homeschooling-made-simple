"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

export function NotificationBell({ unreadCount }: { unreadCount: number }) {
  return (
    <Link
      href="/notifications"
      className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
    >
      <Bell className="w-4.5 h-4.5" strokeWidth={1.75} />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 bg-teal-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
