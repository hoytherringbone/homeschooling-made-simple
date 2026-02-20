import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

export default async function ActivityByUserPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const users = await db.user.findMany({
    where: { role: { not: "SUPER_ADMIN" } },
    include: {
      family: { select: { name: true } },
      _count: { select: { activityLogs: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/activity"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Activity
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Activity by User</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Select a user to view their activity.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#EDE9E3] dark:border-slate-700 divide-y divide-[#EDE9E3] dark:divide-slate-700">
        {users.map((user) => {
          const initial = user.name?.charAt(0).toUpperCase() || "U";
          return (
            <Link
              key={user.id}
              href={`/admin/activity/users/${user.id}`}
              className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-white">{initial}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user.role.toLowerCase().replace("_", " ")} · {user.family.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {user._count.activityLogs} event{user._count.activityLogs !== 1 ? "s" : ""}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </Link>
          );
        })}
        {users.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">No users found.</p>
        )}
      </div>
    </div>
  );
}
