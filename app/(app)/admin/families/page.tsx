import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

export default async function AdminFamiliesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const families = await db.family.findMany({
    where: { name: { not: "HSMS Administration" } },
    include: {
      _count: { select: { users: true, students: true, assignments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

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

      <PageHeader
        title="All Families"
        description={`${families.length} registered families`}
      />

      <div className="bg-white rounded-2xl border border-[#EDE9E3] overflow-hidden">
        <div className="divide-y divide-[#EDE9E3]">
          {families.map((family) => (
            <Link
              key={family.id}
              href={`/admin/families/${family.id}`}
              className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex-1">
                <p className="font-medium text-slate-900">{family.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {family._count.users} user{family._count.users !== 1 ? "s" : ""} · {family._count.students} student{family._count.students !== 1 ? "s" : ""} · {family._count.assignments} assignment{family._count.assignments !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    family.subscriptionStatus === "active"
                      ? "bg-emerald-50 text-emerald-700"
                      : family.subscriptionStatus === "trial"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {family.subscriptionStatus}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </Link>
          ))}
          {families.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">No families registered yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
