import { db } from "@/lib/db";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import {
  Users,
  BookOpen,
  AlertTriangle,
  GraduationCap,
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
      href: "/assignments?status=ASSIGNED",
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
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-[#EDE9E3] dark:border-slate-700 p-5 hover:shadow-sm dark:hover:shadow-slate-900/50 hover:border-teal-200 dark:hover:border-teal-800 transition-all duration-200 cursor-pointer block"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center`}
              >
                <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} strokeWidth={1.75} />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {stat.label}
              </span>
            </div>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Student Overview */}
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
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
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#EDE9E3] dark:border-slate-700 p-5 hover:shadow-sm dark:hover:shadow-slate-900/50 hover:border-teal-200 dark:hover:border-teal-800 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{student.name}</p>
                      {student.gradeLevel && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {student.gradeLevel} Grade
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Progress</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {studentCompleted}/{studentTotal} completed
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
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
