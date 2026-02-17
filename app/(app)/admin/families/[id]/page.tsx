import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

export default async function AdminFamilyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const { id } = await params;

  const family = await db.family.findUnique({
    where: { id },
    include: {
      users: { orderBy: { createdAt: "desc" } },
      students: {
        include: { _count: { select: { assignments: true } } },
        orderBy: { createdAt: "desc" },
      },
      assignments: {
        include: {
          student: { select: { name: true } },
          subject: { select: { name: true, color: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!family) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/families"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Families
        </Link>
      </div>

      <PageHeader
        title={family.name}
        description="Family details"
      />

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-4">
          <p className="text-xs text-slate-500">Subscription</p>
          <span
            className={`inline-block mt-1 text-xs px-2 py-1 rounded-full font-medium ${
              family.subscriptionStatus === "active"
                ? "bg-emerald-50 text-emerald-700"
                : family.subscriptionStatus === "trial"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            {family.subscriptionStatus}
          </span>
        </div>
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-4">
          <p className="text-xs text-slate-500">Trial Ends</p>
          <p className="text-sm font-medium text-slate-900 mt-1">
            {family.trialEndsAt.toLocaleDateString()}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-4">
          <p className="text-xs text-slate-500">Created</p>
          <p className="text-sm font-medium text-slate-900 mt-1">
            {family.createdAt.toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Users ({family.users.length})
          </h2>
          <div className="space-y-3">
            {family.users.map((user) => {
              const isParent = user.role === "PARENT";
              const content = (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div>
                    <p className="font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {user.role.toLowerCase().replace("_", " ")}
                    </span>
                    {isParent && <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>
              );
              return isParent ? (
                <Link key={user.id} href={`/admin/parents/${user.id}`}>
                  {content}
                </Link>
              ) : (
                <div key={user.id}>{content}</div>
              );
            })}
            {family.users.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No users.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Students ({family.students.length})
          </h2>
          <div className="space-y-3">
            {family.students.map((student) => (
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
            {family.students.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No students.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#EDE9E3] p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Recent Assignments ({family.assignments.length})
        </h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {family.assignments.map((assignment) => (
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
          {family.assignments.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No assignments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
