import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

export default async function AdminParentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const parents = await db.user.findMany({
    where: { role: "PARENT" },
    include: { family: { select: { name: true } } },
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
        title="All Parents"
        description={`${parents.length} registered parents`}
      />

      <div className="bg-white rounded-2xl border border-[#EDE9E3] overflow-hidden">
        <div className="divide-y divide-[#EDE9E3]">
          {parents.map((parent) => (
            <Link
              key={parent.id}
              href={`/admin/parents/${parent.id}`}
              className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex-1">
                <p className="font-medium text-slate-900">{parent.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{parent.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{parent.family.name}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </Link>
          ))}
          {parents.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">No parents registered yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
