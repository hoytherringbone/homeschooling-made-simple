import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  BarChart3,
  CheckSquare,
  ClipboardList,
  ChevronRight,
  ClipboardCheck,
  TrendingUp,
  AlertCircle,
  Clock,
} from "lucide-react";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) redirect("/login");
  if (session.user.role === "STUDENT") redirect("/progress");

  const familyId = session.user.familyId;

  const [assignments, attendanceLogs] = await Promise.all([
    db.assignment.findMany({
      where: { familyId },
      select: { id: true, status: true, dueDate: true },
    }),
    db.attendanceLog.findMany({
      where: { familyId },
      select: { hoursLogged: true },
    }),
  ]);

  const now = new Date();
  const total = assignments.length;
  const completed = assignments.filter((a) => a.status === "COMPLETED").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const overdue = assignments.filter(
    (a) => a.dueDate && new Date(a.dueDate) < now && a.status !== "COMPLETED"
  ).length;
  const totalHours = attendanceLogs.reduce((sum, l) => sum + l.hoursLogged, 0);

  const reportTypes = [
    {
      title: "Progress Report",
      description: "Student progress summaries with completion rates and grades by subject",
      href: "/reports/progress",
      icon: BarChart3,
      accent: "teal",
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
      hoverBorder: "hover:border-teal-300",
    },
    {
      title: "Attendance Report",
      description: "Attendance hours by student and subject with daily breakdowns",
      href: "/reports/attendance",
      icon: CheckSquare,
      accent: "blue",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      hoverBorder: "hover:border-blue-300",
    },
    {
      title: "Assignment History",
      description: "Complete assignment records with status, grades, and due dates",
      href: "/reports/assignments",
      icon: ClipboardList,
      accent: "violet",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      hoverBorder: "hover:border-violet-300",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">
          Generate detailed reports for your homeschool records.
        </p>
      </div>

      <div className="bg-slate-50 rounded-2xl border border-[#EDE9E3] px-6 py-4 flex items-center gap-8 flex-wrap">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{total}</span> assignments
          </span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-teal-500" />
          <span className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{completionRate}%</span> completion
          </span>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{overdue}</span> overdue
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{Math.round(totalHours * 10) / 10}</span> attendance hrs
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Link key={report.href} href={report.href}>
              <div
                className={`bg-white rounded-2xl border border-[#EDE9E3] p-6 ${report.hoverBorder} hover:shadow-md transition-all duration-200 cursor-pointer h-full flex flex-col`}
              >
                <div className={`w-12 h-12 ${report.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${report.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{report.title}</h3>
                <p className="text-sm text-slate-500 flex-1">{report.description}</p>
                <div className="flex items-center gap-1 mt-4 text-sm font-medium text-slate-400">
                  <span>View report</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
