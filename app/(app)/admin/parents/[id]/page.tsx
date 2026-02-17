import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

export default async function AdminParentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const { id } = await params;

  const parent = await db.user.findUnique({
    where: { id },
    include: {
      family: {
        include: {
          students: {
            include: { _count: { select: { assignments: true } } },
            orderBy: { createdAt: "desc" },
          },
          assignments: {
            include: {
              student: { select: { name: true } },
              subject: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 15,
          },
        },
      },
    },
  });

  if (!parent) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/parents"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Parents
        </Link>
      </div>

      <PageHeader
        title={parent.name}
        description="Parent details"
      />

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-4">
          <p className="text-xs text-slate-500">Email</p>
          <p className="text-sm font-medium text-slate-900 mt-1">{parent.email}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-4">
          <p className="text-xs text-slate-500">Family</p>
          <Link
            href={`/admin/families/${parent.familyId}`}
            className="text-sm font-medium text-teal-600 hover:text-teal-700 mt-1 inline-block"
          >
            {parent.family.name}
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-4">
          <p className="text-xs text-slate-500">Joined</p>
          <p className="text-sm font-medium text-slate-900 mt-1">
            {parent.createdAt.toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Students ({parent.family.students.length})
          </h2>
          <div className="space-y-3">
            {parent.family.students.map((student) => (
              <Link
                key={student.id}
                href={`/admin/students/${student.id}`}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-900">{student.name}</p>
                  <p className="text-xs text-slate-500">
                    {student.gradeLevel || "No grade"} · {student._count.assignments} assignment{student._count.assignments !== 1 ? "s" : ""}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            ))}
            {parent.family.students.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No students.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Recent Assignments
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {parent.family.assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-900">{assignment.title}</p>
                  <p className="text-xs text-slate-500">
                    {assignment.student.name}
                    {assignment.subject ? ` · ${assignment.subject.name}` : ""}
                    {assignment.dueDate ? ` · Due ${assignment.dueDate.toLocaleDateString()}` : ""}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    assignment.status === "COMPLETED"
                      ? "bg-emerald-50 text-emerald-700"
                      : assignment.status === "IN_PROGRESS"
                        ? "bg-blue-50 text-blue-700"
                        : assignment.status === "SUBMITTED"
                          ? "bg-violet-50 text-violet-700"
                          : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {assignment.status.toLowerCase().replace("_", " ")}
                </span>
              </div>
            ))}
            {parent.family.assignments.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No assignments yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
