import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { GoalCard } from "@/components/goals/goal-card";
import { GoalForm } from "@/components/goals/goal-form";
import { Target } from "lucide-react";

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) redirect("/login");
  if (session.user.role === "STUDENT") redirect("/progress");

  const familyId = session.user.familyId;

  const [goals, students, subjects] = await Promise.all([
    db.goal.findMany({
      where: { familyId },
      include: {
        student: { select: { name: true } },
      },
      orderBy: { termEnd: "asc" },
    }),
    db.student.findMany({
      where: { familyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.subject.findMany({
      where: { familyId },
      select: { id: true, name: true, color: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const subjectMap = new Map(
    subjects.map((s) => [s.id, { name: s.name, color: s.color }])
  );

  const now = new Date();
  const activeGoals = goals.filter(
    (g) => g.currentCount < g.targetCount && new Date(g.termEnd) >= now
  );
  const completedGoals = goals.filter(
    (g) => g.currentCount >= g.targetCount
  );
  const expiredGoals = goals.filter(
    (g) => g.currentCount < g.targetCount && new Date(g.termEnd) < now
  );

  function mapGoal(g: (typeof goals)[0]) {
    const subject = g.subjectId ? subjectMap.get(g.subjectId) : null;
    return {
      id: g.id,
      title: g.title,
      targetCount: g.targetCount,
      currentCount: g.currentCount,
      termStart: g.termStart,
      termEnd: g.termEnd,
      studentName: g.student.name,
      subjectName: subject?.name || null,
      subjectColor: subject?.color || null,
    };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Goals</h1>
          <p className="text-sm text-slate-500 mt-1">
            Set and track learning goals for your students.
          </p>
        </div>
        <GoalForm students={students} subjects={subjects} />
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-teal-600" />
            Active Goals ({activeGoals.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoals.map((g) => (
              <GoalCard key={g.id} goal={mapGoal(g)} />
            ))}
          </div>
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-10 text-center">
          <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">
            No goals yet. Create one to start tracking progress.
          </p>
        </div>
      ) : null}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Completed ({completedGoals.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedGoals.map((g) => (
              <GoalCard key={g.id} goal={mapGoal(g)} showDelete={false} />
            ))}
          </div>
        </div>
      )}

      {/* Expired Goals */}
      {expiredGoals.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Expired ({expiredGoals.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expiredGoals.map((g) => (
              <GoalCard key={g.id} goal={mapGoal(g)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
