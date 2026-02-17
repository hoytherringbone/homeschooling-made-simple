import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminStudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const { id } = await params;

  const student = await db.student.findUnique({
    where: { id },
    include: {
      family: { select: { id: true, name: true } },
      assignments: {
        include: {
          subject: { select: { name: true, color: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      attendanceLogs: {
        orderBy: { date: "desc" },
      },
    },
  });

  if (!student) notFound();

  const totalHours = student.attendanceLogs.reduce((sum, log) => sum + log.hoursLogged, 0);
  const totalDays = new Set(student.attendanceLogs.map((log) => log.date.toDateString())).size;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </Link>
      </div>

      <PageHeader
        title={student.name}
        description="Student details"
      />

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-4">
          <p className="text-xs text-slate-500">Grade</p>
          <p className="text-sm font-medium text-slate-900 mt-1">
            {student.gradeLevel || "Not set"}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-4">
          <p className="text-xs text-slate-500">Family</p>
          <Link
            href={`/admin/families/${student.family.id}`}
            className="text-sm font-medium text-teal-600 hover:text-teal-700 mt-1 inline-block"
          >
            {student.family.name}
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-4">
          <p className="text-xs text-slate-500">Attendance Days</p>
          <p className="text-sm font-medium text-slate-900 mt-1">{totalDays}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-4">
          <p className="text-xs text-slate-500">Total Hours</p>
          <p className="text-sm font-medium text-slate-900 mt-1">{totalHours.toFixed(1)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#EDE9E3] p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Assignments ({student.assignments.length})
        </h2>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {student.assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50"
            >
              <div>
                <p className="font-medium text-slate-900">{assignment.title}</p>
                <p className="text-xs text-slate-500">
                  {assignment.subject ? assignment.subject.name : "No subject"}
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
          {student.assignments.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No assignments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
