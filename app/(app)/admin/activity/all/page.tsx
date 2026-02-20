import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ActivityFeed } from "@/components/admin/activity-feed";

export default async function AllActivityPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const entries = await db.activityLog.findMany({
    include: {
      assignment: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">All Activity</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Most recent 100 events across the platform.
        </p>
      </div>

      <ActivityFeed entries={entries} />
    </div>
  );
}
