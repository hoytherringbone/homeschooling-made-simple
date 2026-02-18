import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CSVExportButton } from "@/components/reports/csv-export-button";
import { ReportFilters } from "@/components/reports/report-filters";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<{ from?: string; to?: string; student?: string; subject?: string; status?: string }>;
}

export default async function AssignmentHistoryPage({ searchParams }: Props) {
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

  const where: any = { familyId };
  if (fromDate || toDate) where.assignedDate = dateFilter;
  if (params.student) where.studentId = params.student;
  if (params.subject) where.subjectId = params.subject;
  if (params.status) where.status = params.status;

  const [students, subjects, assignments] = await Promise.all([
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
    db.assignment.findMany({
      where,
      select: {
        id: true,
        title: true,
        status: true,
        dueDate: true,
        assignedDate: true,
        completedDate: true,
        gradeValue: true,
        gradeLabel: true,
        priority: true,
        studentId: true,
        subjectId: true,
      },
      orderBy: { assignedDate: "desc" },
    }),
  ]);

  const studentMap = new Map(students.map((s) => [s.id, s.name]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

  const studentOptions = students.map((s) => ({ value: s.id, label: s.name }));
  const subjectOptions = subjects.map((s) => ({ value: s.id, label: s.name }));

  const csvData = assignments.map((a) => ({
    title: a.title,
    student: studentMap.get(a.studentId) || "",
    subject: a.subjectId ? subjectMap.get(a.subjectId) || "" : "",
    status: a.status,
    dueDate: a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "",
    assignedDate: new Date(a.assignedDate).toLocaleDateString(),
    completedDate: a.completedDate ? new Date(a.completedDate).toLocaleDateString() : "",
    grade: a.gradeLabel || (a.gradeValue != null ? String(a.gradeValue) : ""),
    priority: a.priority,
  }));

  const csvColumns = [
    { key: "title", label: "Title" },
    { key: "student", label: "Student" },
    { key: "subject", label: "Subject" },
    { key: "status", label: "Status" },
    { key: "dueDate", label: "Due Date" },
    { key: "assignedDate", label: "Assigned Date" },
    { key: "completedDate", label: "Completed Date" },
    { key: "grade", label: "Grade" },
    { key: "priority", label: "Priority" },
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
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Assignment History</h1>
            <p className="text-sm text-slate-500 mt-1">Complete assignment records with status, grades, and due dates</p>
          </div>
        </div>
        <CSVExportButton data={csvData} filename="assignment-history" columns={csvColumns} />
      </div>

      <Suspense>
        <ReportFilters
          showDateRange
          students={studentOptions}
          subjects={subjectOptions}
          showStatus
        />
      </Suspense>

      {assignments.length > 0 ? (
        <div className="bg-white rounded-2xl border border-[#EDE9E3] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EDE9E3] bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Subject</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Due Date</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Assigned</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Grade</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-900">{a.title}</td>
                    <td className="px-4 py-3 text-slate-600">{studentMap.get(a.studentId) || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{a.subjectId ? subjectMap.get(a.subjectId) || "—" : "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(a.assignedDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {a.gradeLabel || (a.gradeValue != null ? a.gradeValue : "—")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400">No assignments found matching filters.</div>
      )}
    </div>
  );
}
