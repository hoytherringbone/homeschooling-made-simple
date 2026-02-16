import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { AssignmentCard } from "@/components/assignments/assignment-card";
import { BookOpen, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface StudentDashboardProps {
  user: {
    id: string;
    name?: string | null;
    role: string;
  };
}

export async function StudentDashboard({ user }: StudentDashboardProps) {
  const student = await db.student.findUnique({
    where: { userId: user.id },
  });

  const firstName = user.name?.split(" ")[0] || "there";

  if (!student) {
    return (
      <div>
        <PageHeader title={`Hey, ${firstName}!`} />
        <EmptyState
          icon={BookOpen}
          title="No student profile found"
          description="Your parent hasn't linked your account to a student profile yet."
        />
      </div>
    );
  }

  const assignments = await db.assignment.findMany({
    where: { studentId: student.id },
    include: {
      student: { select: { id: true, name: true } },
      subject: { select: { name: true, color: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todoAssignments = assignments.filter(
    (a) => a.status === "ASSIGNED" || a.status === "IN_PROGRESS",
  );

  const returned = assignments.filter((a) => a.status === "RETURNED");

  const submitted = assignments.filter((a) => a.status === "SUBMITTED");

  const recentlyCompleted = assignments
    .filter((a) => a.status === "COMPLETED")
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        title={`Hey, ${firstName}!`}
        description="Here's what's on your plate today."
      />

      {assignments.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No assignments yet"
          description="Your assignments will show up here once your parent creates them."
        />
      ) : (
        <div className="space-y-8">
          {/* Returned — needs attention */}
          {returned.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                Needs Revision
              </h2>
              <div className="space-y-3">
                {returned.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    showStudent={false}
                  />
                ))}
              </div>
            </section>
          )}

          {/* To Do */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              To Do
            </h2>
            {todoAssignments.length === 0 ? (
              <p className="text-sm text-slate-500 bg-white rounded-2xl border border-[#EDE9E3] p-5">
                All caught up — nice work!
              </p>
            ) : (
              <div className="space-y-3">
                {todoAssignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    showStudent={false}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Submitted / Waiting for review */}
          {submitted.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Waiting for Review
              </h2>
              <div className="space-y-3">
                {submitted.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    showStudent={false}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Recently Completed */}
          {recentlyCompleted.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Recently Completed
              </h2>
              <div className="space-y-3">
                {recentlyCompleted.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    showStudent={false}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
