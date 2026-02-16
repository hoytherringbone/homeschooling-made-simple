import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { StatCard } from "@/components/reports/stat-card";
import { SubjectBreakdown } from "@/components/reports/subject-breakdown";
import { GoalCard } from "@/components/goals/goal-card";
import {
  ClipboardList,
  CheckCircle2,
  TrendingUp,
  Clock,
  Target,
} from "lucide-react";

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/reports");

  const familyId = session.user.familyId;

  const studentProfile = await db.student.findFirst({
    where: { userId: session.user.id, familyId },
    select: { id: true, name: true },
  });
  if (!studentProfile) redirect("/dashboard");

  const [assignments, subjects, goals] = await Promise.all([
    db.assignment.findMany({
      where: { studentId: studentProfile.id, familyId },
      select: {
        id: true,
        title: true,
        status: true,
        dueDate: true,
        subjectId: true,
        completedDate: true,
        createdAt: true,
      },
    }),
    db.subject.findMany({
      where: { familyId },
      select: { id: true, name: true, color: true },
      orderBy: { name: "asc" },
    }),
    db.goal.findMany({
      where: { studentId: studentProfile.id, familyId, termEnd: { gte: new Date() } },
      include: { student: { select: { name: true } } },
      orderBy: { termEnd: "asc" },
    }),
  ]);

  const now = new Date();
  const total = assignments.length;
  const completed = assignments.filter((a) => a.status === "COMPLETED").length;
  const inProgress = assignments.filter(
    (a) => a.status === "IN_PROGRESS" || a.status === "SUBMITTED"
  ).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // This week stats
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const completedThisWeek = assignments.filter(
    (a) => a.status === "COMPLETED" && a.completedDate && new Date(a.completedDate) >= weekStart
  ).length;

  // This month stats
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const completedThisMonth = assignments.filter(
    (a) => a.status === "COMPLETED" && a.completedDate && new Date(a.completedDate) >= monthStart
  ).length;

  // Subject breakdown
  const subjectStats = subjects
    .map((subject) => {
      const sa = assignments.filter((a) => a.subjectId === subject.id);
      return {
        name: subject.name,
        color: subject.color,
        total: sa.length,
        completed: sa.filter((a) => a.status === "COMPLETED").length,
      };
    })
    .filter((s) => s.total > 0);

  // Upcoming due
  const upcoming = assignments
    .filter(
      (a) =>
        a.dueDate &&
        new Date(a.dueDate) >= now &&
        a.status !== "COMPLETED"
    )
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  // Overdue
  const overdue = assignments.filter(
    (a) =>
      a.dueDate &&
      new Date(a.dueDate) < now &&
      a.status !== "COMPLETED"
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Progress</h1>
        <p className="text-sm text-slate-500 mt-1">
          Track your assignment completion and progress.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total"
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
          label="Active"
          value={inProgress}
          icon={Clock}
          color="text-blue-600"
          bg="bg-blue-50"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">This Week</h2>
          <p className="text-3xl font-bold text-teal-600">{completedThisWeek}</p>
          <p className="text-xs text-slate-500 mt-1">assignments completed</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">This Month</h2>
          <p className="text-3xl font-bold text-teal-600">{completedThisMonth}</p>
          <p className="text-xs text-slate-500 mt-1">assignments completed</p>
        </div>
      </div>

      {/* Overdue Warning */}
      {overdue.length > 0 && (
        <div className="bg-rose-50 rounded-2xl border border-rose-200 p-5">
          <h2 className="text-sm font-semibold text-rose-800 mb-3">
            Overdue ({overdue.length})
          </h2>
          <div className="space-y-2">
            {overdue.map((a) => (
              <a
                key={a.id}
                href={`/assignments/${a.id}`}
                className="flex items-center justify-between text-sm hover:bg-rose-100 rounded-lg px-3 py-2 transition-colors"
              >
                <span className="text-rose-900 font-medium truncate">{a.title}</span>
                <span className="text-rose-600 text-xs shrink-0 ml-2">
                  Due {new Date(a.dueDate!).toLocaleDateString()}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Due */}
      {upcoming.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Coming Up</h2>
          <div className="space-y-2">
            {upcoming.map((a) => (
              <a
                key={a.id}
                href={`/assignments/${a.id}`}
                className="flex items-center justify-between text-sm hover:bg-slate-50 rounded-lg px-3 py-2 transition-colors"
              >
                <span className="text-slate-900 font-medium truncate">{a.title}</span>
                <span className="text-slate-500 text-xs shrink-0 ml-2">
                  Due {new Date(a.dueDate!).toLocaleDateString()}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Goals */}
      {goals.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-teal-600" />
            My Goals ({goals.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((g) => {
              const subject = g.subjectId
                ? subjects.find((s) => s.id === g.subjectId)
                : null;
              return (
                <GoalCard
                  key={g.id}
                  goal={{
                    id: g.id,
                    title: g.title,
                    targetCount: g.targetCount,
                    currentCount: g.currentCount,
                    termStart: g.termStart,
                    termEnd: g.termEnd,
                    studentName: g.student.name,
                    subjectName: subject?.name || null,
                    subjectColor: subject?.color || null,
                  }}
                  showDelete={false}
                />
              );
            })}
          </div>
        </div>
      )}

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
