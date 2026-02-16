import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { StatCard } from "@/components/reports/stat-card";
import { SubjectBreakdown } from "@/components/reports/subject-breakdown";
import { StudentSummaryCard } from "@/components/reports/student-summary-card";
import {
  ClipboardList,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  BarChart3,
} from "lucide-react";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) redirect("/login");
  if (session.user.role === "STUDENT") redirect("/progress");

  const familyId = session.user.familyId;

  const [assignments, students, subjects] = await Promise.all([
    db.assignment.findMany({
      where: { familyId },
      select: {
        id: true,
        status: true,
        dueDate: true,
        studentId: true,
        subjectId: true,
      },
    }),
    db.student.findMany({
      where: { familyId },
      select: { id: true, name: true, gradeLevel: true },
      orderBy: { name: "asc" },
    }),
    db.subject.findMany({
      where: { familyId },
      select: { id: true, name: true, color: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const now = new Date();
  const total = assignments.length;
  const completed = assignments.filter((a) => a.status === "COMPLETED").length;
  const inProgress = assignments.filter(
    (a) => a.status === "IN_PROGRESS" || a.status === "SUBMITTED"
  ).length;
  const overdue = assignments.filter(
    (a) =>
      a.dueDate &&
      new Date(a.dueDate) < now &&
      a.status !== "COMPLETED"
  ).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Subject breakdown
  const subjectStats = subjects.map((subject) => {
    const subjectAssignments = assignments.filter((a) => a.subjectId === subject.id);
    return {
      name: subject.name,
      color: subject.color,
      total: subjectAssignments.length,
      completed: subjectAssignments.filter((a) => a.status === "COMPLETED").length,
    };
  }).filter((s) => s.total > 0);

  // No-subject assignments
  const noSubject = assignments.filter((a) => !a.subjectId);
  if (noSubject.length > 0) {
    subjectStats.push({
      name: "No Subject",
      color: null,
      total: noSubject.length,
      completed: noSubject.filter((a) => a.status === "COMPLETED").length,
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">
          Family progress overview across all students.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Assignments"
          value={total}
          icon={ClipboardList}
          color="text-slate-600"
          bg="bg-slate-100"
        />
        <StatCard
          label="Completed"
          value={completed}
          icon={CheckCircle2}
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatCard
          label="Completion Rate"
          value={`${completionRate}%`}
          icon={TrendingUp}
          color="text-teal-600"
          bg="bg-teal-50"
        />
        <StatCard
          label="Overdue"
          value={overdue}
          icon={AlertCircle}
          color="text-rose-600"
          bg="bg-rose-50"
        />
      </div>

      {/* Status breakdown bar */}
      {total > 0 && (
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Status Distribution
          </h2>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
            {[
              { status: "COMPLETED", color: "bg-green-500", count: completed },
              { status: "SUBMITTED", color: "bg-amber-400", count: assignments.filter((a) => a.status === "SUBMITTED").length },
              { status: "IN_PROGRESS", color: "bg-blue-500", count: assignments.filter((a) => a.status === "IN_PROGRESS").length },
              { status: "RETURNED", color: "bg-rose-400", count: assignments.filter((a) => a.status === "RETURNED").length },
              { status: "ASSIGNED", color: "bg-slate-300", count: assignments.filter((a) => a.status === "ASSIGNED").length },
            ].map((s) =>
              s.count > 0 ? (
                <div
                  key={s.status}
                  className={`${s.color} transition-all`}
                  style={{ width: `${(s.count / total) * 100}%` }}
                  title={`${s.status}: ${s.count}`}
                />
              ) : null
            )}
          </div>
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {[
              { label: "Completed", color: "bg-green-500", count: completed },
              { label: "Submitted", color: "bg-amber-400", count: assignments.filter((a) => a.status === "SUBMITTED").length },
              { label: "In Progress", color: "bg-blue-500", count: assignments.filter((a) => a.status === "IN_PROGRESS").length },
              { label: "Returned", color: "bg-rose-400", count: assignments.filter((a) => a.status === "RETURNED").length },
              { label: "Assigned", color: "bg-slate-300", count: assignments.filter((a) => a.status === "ASSIGNED").length },
            ].filter((s) => s.count > 0).map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                <span className="text-xs text-slate-600">
                  {s.label} ({s.count})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Progress */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-slate-400" />
          By Student
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {students.map((student) => {
            const sa = assignments.filter((a) => a.studentId === student.id);
            return (
              <StudentSummaryCard
                key={student.id}
                student={student}
                total={sa.length}
                completed={sa.filter((a) => a.status === "COMPLETED").length}
                inProgress={sa.filter((a) => a.status === "IN_PROGRESS" || a.status === "SUBMITTED").length}
                overdue={sa.filter((a) => a.dueDate && new Date(a.dueDate) < now && a.status !== "COMPLETED").length}
              />
            );
          })}
        </div>
      </div>

      {/* Subject Breakdown */}
      {subjectStats.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            By Subject
          </h2>
          <SubjectBreakdown subjects={subjectStats} />
        </div>
      )}
    </div>
  );
}
