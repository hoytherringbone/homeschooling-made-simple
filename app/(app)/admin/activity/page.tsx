import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Activity, Home, Users } from "lucide-react";

export default async function ActivityHubPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const [activityCount, familyCount, userCount] = await Promise.all([
    db.activityLog.count(),
    db.family.count({ where: { name: { not: "HSMS Administration" } } }),
    db.user.count({ where: { role: { not: "SUPER_ADMIN" } } }),
  ]);

  const cards = [
    {
      label: "All Activity",
      description: "View all recent activity across the platform",
      value: activityCount,
      icon: Activity,
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-50 dark:bg-teal-900/30",
      href: "/admin/activity/all",
    },
    {
      label: "By Family",
      description: "Filter activity by family",
      value: familyCount,
      subtitle: "families",
      icon: Home,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/30",
      href: "/admin/activity/families",
    },
    {
      label: "By User",
      description: "Filter activity by user",
      value: userCount,
      subtitle: "users",
      icon: Users,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-900/30",
      href: "/admin/activity/users",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">User Activity</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor what&apos;s happening across the platform.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-[#EDE9E3] dark:border-slate-700 p-6 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-sm transition-all"
          >
            <div className={`${card.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {card.value}
            </p>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">
              {card.label}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
