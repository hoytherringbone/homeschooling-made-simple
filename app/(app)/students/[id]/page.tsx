import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { AssignmentFilters } from "@/components/assignments/assignment-filters";
import { CatchUpFlow } from "@/components/assignments/catch-up-flow";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ subject?: string; status?: string; range?: string }>;
}

export default async function StudentDetailPage({ params, searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) redirect("/login");
  if (session.user.role === "STUDENT") redirect("/dashboard");

  const { id } = await params;
  const sp = await searchParams;
  const familyId = session.user.familyId;

  const student = await db.student.findFirst({
    where: { id, familyId },
    select: { id: true, name: true, gradeLevel: true },
  });

  if (!student) notFound();

  // Build assignment where clause
  const assignmentWhere: Record<string, unknown> = {
    studentId: id,
    familyId,
  };

  if (sp.subject) assignmentWhere.subjectId = sp.subject;
  if (sp.status) assignmentWhere.status = sp.status;

  // Time range filter
  if (sp.range === "week") {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    assignmentWhere.dueDate = { gte: monday, lte: sunday };
  } else if (sp.range === "month") {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    assignmentWhere.dueDate = { gte: startOfMonth, lte: endOfMonth };
  }

  const [assignments, subjects] = await Promise.all([
    db.assignment.findMany({
      where: assignmentWhere,
      include: {
        student: { select: { id: true, name: true } },
        subject: { select: { name: true, color: true } },
      },
      orderBy: [{ dueDate: "asc" }, { assignedDate: "desc" }],
    }),
    db.subject.findMany({
      where: { familyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const total = assignments.length;
  const completed = assignments.filter((a) => a.status === "COMPLETED").length;
  const assigned = assignments.filter((a) => a.status === "ASSIGNED").length;

  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Serialize assignments for the client component (dates → ISO strings)
  const serializedAssignments = assignments.map((a) => ({
    ...a,
    dueDate: a.dueDate ? a.dueDate.toISOString() : null,
    assignedDate: a.assignedDate.toISOString(),
    completedDate: a.completedDate ? a.completedDate.toISOString() : null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <Link
        href="/students"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to students
      </Link>

      {/* Student header */}
      <div className="bg-white rounded-2xl border border-[#EDE9E3] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-teal-600 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-white">{initials}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {student.name}
              </h1>
              {student.gradeLevel && (
                <p className="text-sm text-slate-500">
                  {student.gradeLevel} Grade
                </p>
              )}
            </div>
          </div>
          <Link
            href={`/assignments/new?studentId=${student.id}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-full transition-colors"
          >
            <Plus className="w-4 h-4" />
            Assign Work
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { label: "Total", value: total, color: "bg-slate-50 text-slate-700" },
            { label: "Assigned", value: assigned, color: "bg-blue-50 text-blue-700" },
            { label: "Completed", value: completed, color: "bg-green-50 text-green-700" },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-xl py-3 text-center ${stat.color}`}
            >
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-[10px] font-medium mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <AssignmentFilters
        students={[]}
        subjects={subjects.map((s) => ({ value: s.id, label: s.name }))}
        showStudentFilter={false}
      />

      {/* Assignments with Catch Up */}
      <CatchUpFlow
        assignments={serializedAssignments}
        studentId={student.id}
        backPath={`/students/${id}`}
      />
    </div>
  );
}
