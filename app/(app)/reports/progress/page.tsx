import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ReportFilters } from "@/components/reports/report-filters";
import { CSVExportButton } from "@/components/reports/csv-export-button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import { ASSIGNMENT_CATEGORIES } from "@/lib/constants";

interface Props {
  searchParams: Promise<{ from?: string; to?: string }>;
}

function calculateWeightedGPA(
  assignments: { category: string | null; gradeValue: number | null }[],
  weights: { category: string; weight: number }[]
): number | null {
  const graded = assignments.filter((a) => a.gradeValue != null);
  if (graded.length === 0) return null;

  // No weights configured — simple average
  if (weights.length === 0) {
    return Math.round((graded.reduce((s, a) => s + a.gradeValue!, 0) / graded.length) * 10) / 10;
  }

  let totalWeight = 0;
  let weightedSum = 0;

  for (const w of weights) {
    const catAssignments = graded.filter((a) => a.category === w.category);
    if (catAssignments.length === 0) continue;
    const avg = catAssignments.reduce((s, a) => s + a.gradeValue!, 0) / catAssignments.length;
    weightedSum += avg * (w.weight / 100);
    totalWeight += w.weight;
  }

  // Also include uncategorized graded assignments as simple average fallback
  const uncategorized = graded.filter((a) => !a.category || !weights.some((w) => w.category === a.category));

  if (totalWeight === 0 && uncategorized.length === 0) return null;

  if (totalWeight > 0 && uncategorized.length === 0) {
    // Scale up if some categories have no assignments yet
    return Math.round((weightedSum / totalWeight * 100) * 10) / 10;
  }

  if (totalWeight === 0) {
    // All assignments are uncategorized
    return Math.round((uncategorized.reduce((s, a) => s + a.gradeValue!, 0) / uncategorized.length) * 10) / 10;
  }

  // Mix: weighted categories + uncategorized as simple average
  const scaledWeighted = weightedSum / totalWeight * 100;
  const uncatAvg = uncategorized.reduce((s, a) => s + a.gradeValue!, 0) / uncategorized.length;
  const catCount = graded.length - uncategorized.length;
  const totalCount = graded.length;
  const blended = (scaledWeighted * catCount + uncatAvg * uncategorized.length) / totalCount;
  return Math.round(blended * 10) / 10;
}

function gpaToLabel(gpa: number): string {
  if (gpa >= 3.85) return "A";
  if (gpa >= 3.5) return "A-";
  if (gpa >= 3.15) return "B+";
  if (gpa >= 2.85) return "B";
  if (gpa >= 2.5) return "B-";
  if (gpa >= 2.15) return "C+";
  if (gpa >= 1.85) return "C";
  if (gpa >= 1.5) return "C-";
  if (gpa >= 1.15) return "D+";
  if (gpa >= 0.5) return "D";
  return "F";
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

  const [students, subjects, assignments, allWeights] = await Promise.all([
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
        category: true,
        gradeValue: true,
      },
    }),
    db.subjectWeight.findMany({
      where: { subject: { familyId } },
      select: { subjectId: true, category: true, weight: true },
    }),
  ]);

  // Group weights by subject
  const weightsBySubject = new Map<string, { category: string; weight: number }[]>();
  for (const w of allWeights) {
    const existing = weightsBySubject.get(w.subjectId) || [];
    existing.push({ category: w.category, weight: w.weight });
    weightsBySubject.set(w.subjectId, existing);
  }

  const csvData: Record<string, any>[] = [];

  const studentData = students.map((student) => {
    const sa = assignments.filter((a) => a.studentId === student.id);
    const completed = sa.filter((a) => a.status === "COMPLETED").length;
    const rate = sa.length > 0 ? Math.round((completed / sa.length) * 100) : 0;

    // Overall GPA: weighted across all subjects
    const allGraded = sa.filter((a) => a.gradeValue != null);
    const simpleAvg = allGraded.length > 0
      ? Math.round((allGraded.reduce((s, a) => s + a.gradeValue!, 0) / allGraded.length) * 10) / 10
      : null;

    const subjectBreakdown = subjects
      .map((subject) => {
        const subjectAssignments = sa.filter((a) => a.subjectId === subject.id);
        if (subjectAssignments.length === 0) return null;
        const subCompleted = subjectAssignments.filter((a) => a.status === "COMPLETED").length;
        const subRate = Math.round((subCompleted / subjectAssignments.length) * 100);

        const weights = weightsBySubject.get(subject.id) || [];
        const weightedGPA = calculateWeightedGPA(subjectAssignments, weights);
        const hasWeights = weights.length > 0;

        csvData.push({
          student: student.name,
          gradeLevel: student.gradeLevel || "",
          subject: subject.name,
          total: subjectAssignments.length,
          completed: subCompleted,
          completionRate: `${subRate}%`,
          gpa: weightedGPA ?? "",
          gpaLetter: weightedGPA != null ? gpaToLabel(weightedGPA) : "",
          weighted: hasWeights ? "Yes" : "No",
        });

        return {
          name: subject.name,
          subjectId: subject.id,
          total: subjectAssignments.length,
          completed: subCompleted,
          rate: subRate,
          weightedGPA,
          hasWeights,
        };
      })
      .filter(Boolean) as { name: string; subjectId: string; total: number; completed: number; rate: number; weightedGPA: number | null; hasWeights: boolean }[];

    const noSubject = sa.filter((a) => !a.subjectId);
    if (noSubject.length > 0) {
      const nsCompleted = noSubject.filter((a) => a.status === "COMPLETED").length;
      const nsRate = Math.round((nsCompleted / noSubject.length) * 100);
      const nsGrades = noSubject.filter((a) => a.gradeValue != null).map((a) => a.gradeValue!);
      const nsAvg = nsGrades.length > 0 ? Math.round((nsGrades.reduce((s, g) => s + g, 0) / nsGrades.length) * 10) / 10 : null;
      subjectBreakdown.push({ name: "No Subject", subjectId: "", total: noSubject.length, completed: nsCompleted, rate: nsRate, weightedGPA: nsAvg, hasWeights: false });
      csvData.push({
        student: student.name,
        gradeLevel: student.gradeLevel || "",
        subject: "No Subject",
        total: noSubject.length,
        completed: nsCompleted,
        completionRate: `${nsRate}%`,
        gpa: nsAvg ?? "",
        gpaLetter: nsAvg != null ? gpaToLabel(nsAvg) : "",
        weighted: "No",
      });
    }

    // Overall weighted GPA: average of subject GPAs that have data
    const subjectGPAs = subjectBreakdown.filter((s) => s.weightedGPA != null).map((s) => s.weightedGPA!);
    const overallGPA = subjectGPAs.length > 0
      ? Math.round((subjectGPAs.reduce((s, g) => s + g, 0) / subjectGPAs.length) * 10) / 10
      : simpleAvg;

    return { student, total: sa.length, completed, rate, overallGPA, subjectBreakdown };
  });

  const csvColumns = [
    { key: "student", label: "Student" },
    { key: "gradeLevel", label: "Grade Level" },
    { key: "subject", label: "Subject" },
    { key: "total", label: "Assignments Total" },
    { key: "completed", label: "Assignments Completed" },
    { key: "completionRate", label: "Completion Rate" },
    { key: "gpa", label: "GPA" },
    { key: "gpaLetter", label: "Letter Grade" },
    { key: "weighted", label: "Weighted" },
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
        {studentData.map(({ student, total, completed, rate, overallGPA, subjectBreakdown }) => (
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
                {overallGPA !== null && (
                  <p className="text-sm font-semibold text-teal-600">
                    GPA: {overallGPA} ({gpaToLabel(overallGPA)})
                  </p>
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
                      {sub.weightedGPA !== null && (
                        <span className={`text-xs font-medium ${sub.hasWeights ? "text-teal-600" : "text-slate-400"}`}>
                          {sub.weightedGPA} ({gpaToLabel(sub.weightedGPA)})
                          {sub.hasWeights && <span className="ml-1 text-[10px] text-teal-400">weighted</span>}
                        </span>
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
