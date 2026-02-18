import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CSVExportButton } from "@/components/reports/csv-export-button";
import { ReportFilters } from "@/components/reports/report-filters";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function AttendanceReportPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) redirect("/login");
  if (session.user.role === "STUDENT") redirect("/progress");

  const familyId = session.user.familyId;
  const params = await searchParams;
  const fromDate = params.from ? new Date(params.from) : undefined;
  const toDate = params.to ? new Date(params.to + "T23:59:59") : undefined;

  const dateFilter: any = {};
  if (fromDate) dateFilter.gte = fromDate;
  if (toDate) dateFilter.lte = toDate;

  const [students, subjects, logs] = await Promise.all([
    db.student.findMany({
      where: { familyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.subject.findMany({
      where: { familyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.attendanceLog.findMany({
      where: {
        familyId,
        ...(fromDate || toDate ? { date: dateFilter } : {}),
      },
      select: {
        id: true,
        date: true,
        hoursLogged: true,
        subjectId: true,
        studentId: true,
        notes: true,
      },
      orderBy: { date: "desc" },
    }),
  ]);

  const studentMap = new Map(students.map((s) => [s.id, s.name]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

  const totalHours = logs.reduce((sum, l) => sum + l.hoursLogged, 0);
  const uniqueDays = new Set(logs.map((l) => new Date(l.date).toDateString())).size;

  const studentBreakdown = students.map((student) => {
    const studentLogs = logs.filter((l) => l.studentId === student.id);
    const hours = studentLogs.reduce((sum, l) => sum + l.hoursLogged, 0);
    const days = new Set(studentLogs.map((l) => new Date(l.date).toDateString())).size;
    return {
      name: student.name,
      hours: Math.round(hours * 10) / 10,
      days,
      avgPerDay: days > 0 ? Math.round((hours / days) * 10) / 10 : 0,
    };
  }).filter((s) => s.hours > 0);

  const subjectBreakdown = subjects
    .map((subject) => {
      const subjectLogs = logs.filter((l) => l.subjectId === subject.id);
      const hours = subjectLogs.reduce((sum, l) => sum + l.hoursLogged, 0);
      return { name: subject.name, hours: Math.round(hours * 10) / 10 };
    })
    .filter((s) => s.hours > 0);

  const csvData = logs.map((log) => ({
    date: new Date(log.date).toLocaleDateString(),
    student: studentMap.get(log.studentId) || "",
    subject: log.subjectId ? subjectMap.get(log.subjectId) || "" : "",
    hours: log.hoursLogged,
    notes: log.notes || "",
  }));

  const csvColumns = [
    { key: "date", label: "Date" },
    { key: "student", label: "Student" },
    { key: "subject", label: "Subject" },
    { key: "hours", label: "Hours" },
    { key: "notes", label: "Notes" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/reports"
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Attendance Report</h1>
            <p className="text-sm text-slate-500 mt-1">Attendance hours by student and subject</p>
          </div>
        </div>
        <CSVExportButton data={csvData} filename="attendance-report" columns={csvColumns} />
      </div>

      <Suspense>
        <ReportFilters showDateRange />
      </Suspense>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Total Days Logged</p>
          <p className="text-2xl font-semibold text-slate-900">{uniqueDays}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Total Hours Logged</p>
          <p className="text-2xl font-semibold text-slate-900">{Math.round(totalHours * 10) / 10}</p>
        </div>
      </div>

      {studentBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">By Student</h2>
          <div className="space-y-3">
            {studentBreakdown.map((s) => (
              <div key={s.name} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">{s.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">{s.name}</span>
                </div>
                <div className="flex items-center gap-6 text-sm text-slate-500">
                  <span>{s.hours} hrs</span>
                  <span>{s.days} days</span>
                  <span>{s.avgPerDay} hrs/day</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subjectBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">By Subject</h2>
          <div className="space-y-3">
            {subjectBreakdown.map((s) => {
              const pct = totalHours > 0 ? Math.round((s.hours / totalHours) * 100) : 0;
              return (
                <div key={s.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{s.name}</span>
                    <span className="text-slate-500">{s.hours} hrs ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {studentBreakdown.length === 0 && (
        <div className="text-center py-12 text-slate-400">No attendance logs found for the selected period.</div>
      )}
    </div>
  );
}
