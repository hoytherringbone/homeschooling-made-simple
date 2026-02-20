import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

export default async function ActivityByFamilyPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const families = await db.family.findMany({
    where: { name: { not: "HSMS Administration" } },
    include: {
      _count: { select: { users: true, students: true } },
      assignments: {
        select: { id: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // Get activity counts per family by going through assignments
  const familyActivityCounts = await Promise.all(
    families.map(async (family) => {
      const assignmentIds = family.assignments.map((a) => a.id);
      const count = assignmentIds.length > 0
        ? await db.activityLog.count({
            where: { assignmentId: { in: assignmentIds } },
          })
        : 0;
      return { familyId: family.id, count };
    })
  );

  const countMap = new Map(familyActivityCounts.map((c) => [c.familyId, c.count]));

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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Activity by Family</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Select a family to view their activity.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#EDE9E3] dark:border-slate-700 divide-y divide-[#EDE9E3] dark:divide-slate-700">
        {families.map((family) => (
          <Link
            key={family.id}
            href={`/admin/activity/families/${family.id}`}
            className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">{family.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {family._count.users} user{family._count.users !== 1 ? "s" : ""} · {family._count.students} student{family._count.students !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {countMap.get(family.id) || 0} events
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </Link>
        ))}
        {families.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">No families found.</p>
        )}
      </div>
    </div>
  );
}
