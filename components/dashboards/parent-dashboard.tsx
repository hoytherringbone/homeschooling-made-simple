import { db } from "@/lib/db";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { StatusActions } from "@/components/assignments/status-actions";
import {
  Users,
  BookOpen,
  ClipboardCheck,
  AlertTriangle,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

interface ParentDashboardProps {
  user: {
    id: string;
    name?: string | null;
    familyId: string;
    role: string;
  };
}

export async function ParentDashboard({ user }: ParentDashboardProps) {
  const familyId = user.familyId;

  const [students, subjects, assignments] = await Promise.all([
    db.student.findMany({ where: { familyId } }),
    db.subject.findMany({ where: { familyId } }),
    db.assignment.findMany({
      where: { familyId },
      include: { student: true, subject: true },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const assignmentsThisWeek = assignments.filter(
    (a) => a.dueDate && a.dueDate >= now && a.dueDate <= weekFromNow,
  );
  const awaitingReview = assignments.filter(
    (a) => a.status === "SUBMITTED",
  );
  const overdue = assignments.filter(
    (a) => a.dueDate && a.dueDate < now && a.status !== "COMPLETED",
  );

  const firstName = user.name?.split(" ")[0] || "there";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const stats = [
    {
      label: "Students",
      value: students.length,
      icon: Users,
      color: "text-teal-600",
      bg: "bg-teal-50",
      href: "/students",
    },
    {
      label: "Due This Week",
      value: assignmentsThisWeek.length,
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/assignments?status=ASSIGNED&status=IN_PROGRESS",
    },
    {
      label: "Awaiting Review",
      value: awaitingReview.length,
      icon: ClipboardCheck,
      color: "text-amber-600",
      bg: "bg-amber-50",
      href: "/assignments?status=SUBMITTED",
    },
    {
      label: "Overdue",
      value: overdue.length,
      icon: AlertTriangle,
      color: "text-rose-600",
      bg: "bg-rose-50",
      href: "/assignments?overdue=true",
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description={today}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-2xl border border-[#EDE9E3] p-5 hover:shadow-sm hover:border-teal-200 transition-all duration-200 cursor-pointer block"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center`}
              >
                <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} strokeWidth={1.75} />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {stat.label}
              </span>
            </div>
            <p className="text-2xl font-semibold text-slate-900">
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Awaiting Review */}
      {awaitingReview.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-amber-500" />
              Awaiting Review
            </h2>
            <Link
              href="/assignments?status=SUBMITTED"
              className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {awaitingReview.slice(0, 5).map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white rounded-2xl border border-[#EDE9E3] p-4 space-y-3"
              >
                <div className="flex items-center gap-3">
                  {assignment.subject && (
                    <div
                      className="w-1 h-10 rounded-full shrink-0"
                      style={{
                        backgroundColor: assignment.subject.color || "#94a3b8",
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/assignments/${assignment.id}`}
                      className="font-medium text-slate-900 hover:text-teal-700 transition-colors truncate block"
                    >
                      {assignment.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500">
                        {assignment.student.name}
                      </span>
                      {assignment.subject && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs text-slate-500">
                            {assignment.subject.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={assignment.status} />
                </div>
                <StatusActions
                  assignmentId={assignment.id}
                  currentStatus={assignment.status}
                  userRole={user.role}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Overview */}
      <h2 className="text-lg font-semibold text-slate-900 mb-4">
        Student Overview
      </h2>

      {students.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No students yet"
          description="Add students through the onboarding wizard or settings to get started."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {students.map((student) => {
            const studentAssignments = assignments.filter(
              (a) => a.studentId === student.id,
            );
            const studentCompleted = studentAssignments.filter(
              (a) => a.status === "COMPLETED",
            ).length;
            const studentTotal = studentAssignments.length;
            const progress =
              studentTotal > 0
                ? Math.round((studentCompleted / studentTotal) * 100)
                : 0;

            return (
              <Link key={student.id} href={`/students/${student.id}`}>
                <div className="bg-white rounded-2xl border border-[#EDE9E3] p-5 hover:shadow-sm hover:border-teal-200 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-teal-700">
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{student.name}</p>
                      {student.gradeLevel && (
                        <p className="text-xs text-slate-500">
                          {student.gradeLevel} Grade
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-medium text-slate-700">
                        {studentCompleted}/{studentTotal} completed
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
