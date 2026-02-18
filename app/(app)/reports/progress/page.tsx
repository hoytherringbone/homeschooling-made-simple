import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ReportFilters } from "@/components/reports/report-filters";
import { CSVExportButton } from "@/components/reports/csv-export-button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function ProgressReportPage({ searchParams }: Props) {
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

  const [students, subjects, assignments] = await Promise.all([
    db.student.findMany({
      where: { familyId },
      select: { id: true, name: true, gradeLevel: true },
      orderBy: { name: "asc" },
    }),
    db.subject.findMany({
      where: { familyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.assignment.findMany({
      where: {
        familyId,
        ...(fromDate || toDate ? { assignedDate: dateFilter } : {}),
      },
      select: {
        id: true,
        status: true,
        studentId: true,
        subjectId: true,
        gradeValue: true,
      },
    }),
  ]);

  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

  const csvData: Record<string, any>[] = [];

  const studentData = students.map((student) => {
    const sa = assignments.filter((a) => a.studentId === student.id);
    const completed = sa.filter((a) => a.status === "COMPLETED").length;
    const rate = sa.length > 0 ? Math.round((completed / sa.length) * 100) : 0;
    const grades = sa.filter((a) => a.gradeValue != null).map((a) => a.gradeValue!);
    const avgGrade = grades.length > 0 ? Math.round((grades.reduce((s, g) => s + g, 0) / grades.length) * 10) / 10 : null;

    const subjectBreakdown = subjects
      .map((subject) => {
        const subjectAssignments = sa.filter((a) => a.subjectId === subject.id);
        if (subjectAssignments.length === 0) return null;
        const subCompleted = subjectAssignments.filter((a) => a.status === "COMPLETED").length;
        const subRate = Math.round((subCompleted / subjectAssignments.length) * 100);
        const subGrades = subjectAssignments.filter((a) => a.gradeValue != null).map((a) => a.gradeValue!);
        const subAvg = subGrades.length > 0 ? Math.round((subGrades.reduce((s, g) => s + g, 0) / subGrades.length) * 10) / 10 : null;

        csvData.push({
          student: student.name,
          gradeLevel: student.gradeLevel || "",
          subject: subject.name,
          total: subjectAssignments.length,
          completed: subCompleted,
          completionRate: `${subRate}%`,
          avgGrade: subAvg ?? "",
        });

        return {
          name: subject.name,
          total: subjectAssignments.length,
          completed: subCompleted,
          rate: subRate,
          avgGrade: subAvg,
        };
      })
      .filter(Boolean) as { name: string; total: number; completed: number; rate: number; avgGrade: number | null }[];

    const noSubject = sa.filter((a) => !a.subjectId);
    if (noSubject.length > 0) {
      const nsCompleted = noSubject.filter((a) => a.status === "COMPLETED").length;
      const nsRate = Math.round((nsCompleted / noSubject.length) * 100);
      const nsGrades = noSubject.filter((a) => a.gradeValue != null).map((a) => a.gradeValue!);
      const nsAvg = nsGrades.length > 0 ? Math.round((nsGrades.reduce((s, g) => s + g, 0) / nsGrades.length) * 10) / 10 : null;
      subjectBreakdown.push({ name: "No Subject", total: noSubject.length, completed: nsCompleted, rate: nsRate, avgGrade: nsAvg });
      csvData.push({
        student: student.name,
        gradeLevel: student.gradeLevel || "",
        subject: "No Subject",
        total: noSubject.length,
        completed: nsCompleted,
        completionRate: `${nsRate}%`,
        avgGrade: nsAvg ?? "",
      });
    }

    return { student, total: sa.length, completed, rate, avgGrade, subjectBreakdown };
  });

  const csvColumns = [
    { key: "student", label: "Student" },
    { key: "gradeLevel", label: "Grade Level" },
    { key: "subject", label: "Subject" },
    { key: "total", label: "Assignments Total" },
    { key: "completed", label: "Assignments Completed" },
    { key: "completionRate", label: "Completion Rate" },
    { key: "avgGrade", label: "Average Grade" },
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
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Progress Report</h1>
            <p className="text-sm text-slate-500 mt-1">Student progress summaries with completion rates and grades</p>
          </div>
        </div>
        <CSVExportButton data={csvData} filename="progress-report" columns={csvColumns} />
      </div>

      <Suspense>
        <ReportFilters showDateRange />
      </Suspense>

      <div className="space-y-5">
        {studentData.map(({ student, total, completed, rate, avgGrade, subjectBreakdown }) => (
          <div key={student.id} className="bg-white rounded-2xl border border-[#EDE9E3] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">{student.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">{student.name}</p>
                  {student.gradeLevel && <p className="text-xs text-slate-500">{student.gradeLevel} Grade</p>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">
                  {completed} / {total} completed
                </p>
                {avgGrade !== null && (
                  <p className="text-xs text-slate-400">Avg grade: {avgGrade}</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500">Completion Rate</span>
                <span className="text-xs font-medium text-slate-700">{rate}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-600 rounded-full transition-all" style={{ width: `${rate}%` }} />
              </div>
            </div>

            {subjectBreakdown.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">By Subject</p>
                {subjectBreakdown.map((sub) => (
                  <div key={sub.name} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{sub.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">
                        {sub.completed}/{sub.total} ({sub.rate}%)
                      </span>
                      {sub.avgGrade !== null && (
                        <span className="text-xs text-slate-400">avg: {sub.avgGrade}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {studentData.length === 0 && (
          <div className="text-center py-12 text-slate-400">No students found.</div>
        )}
      </div>
    </div>
  );
}
