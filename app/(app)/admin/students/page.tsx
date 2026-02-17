import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

export default async function AdminStudentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const students = await db.student.findMany({
    include: {
      family: { select: { name: true } },
      _count: { select: { assignments: true } },
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
        title="All Students"
        description={`${students.length} registered students`}
      />

      <div className="bg-white rounded-2xl border border-[#EDE9E3] overflow-hidden">
        <div className="divide-y divide-[#EDE9E3]">
          {students.map((student) => (
            <Link
              key={student.id}
              href={`/admin/students/${student.id}`}
              className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex-1">
                <p className="font-medium text-slate-900">{student.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {student.gradeLevel || "No grade"} · {student.family.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">
                  {student._count.assignments} assignment{student._count.assignments !== 1 ? "s" : ""}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </Link>
          ))}
          {students.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">No students registered yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
