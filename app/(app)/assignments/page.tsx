import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";
import { AssignmentCard } from "@/components/assignments/assignment-card";
import { AssignmentFilters } from "@/components/assignments/assignment-filters";

interface PageProps {
  searchParams: Promise<{ student?: string; subject?: string; status?: string; overdue?: string }>;
}

export default async function AssignmentsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) redirect("/login");

  const params = await searchParams;
  const familyId = session.user.familyId;
  const isStudent = session.user.role === "STUDENT";

  // Build where clause
  const where: Record<string, unknown> = { familyId };

  // Students can only see their own assignments
  if (isStudent) {
    const studentProfile = await db.student.findFirst({
      where: { userId: session.user.id, familyId },
      select: { id: true },
    });
    if (!studentProfile) redirect("/dashboard");
    where.studentId = studentProfile.id;
  } else if (params.student) {
    where.studentId = params.student;
  }

  if (params.subject) {
    where.subjectId = params.subject;
  }

  if (params.overdue === "true") {
    where.dueDate = { lt: new Date() };
    where.status = { not: "COMPLETED" };
  } else if (params.status) {
    where.status = params.status;
  }

  const [assignments, students, subjects] = await Promise.all([
    db.assignment.findMany({
      where,
      include: {
        student: { select: { id: true, name: true } },
        subject: { select: { name: true, color: true } },
      },
      orderBy: [{ dueDate: "asc" }, { assignedDate: "desc" }],
    }),
    isStudent
      ? Promise.resolve([])
      : db.student.findMany({
          where: { familyId },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        }),
    db.subject.findMany({
      where: { familyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isStudent ? "My Work" : "Assignments"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {assignments.length} assignment{assignments.length !== 1 ? "s" : ""}
          </p>
        </div>
        {!isStudent && (
          <Link
            href="/assignments/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-full transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Assignment
          </Link>
        )}
      </div>

      {/* Filters */}
      <AssignmentFilters
        students={students.map((s) => ({ value: s.id, label: s.name }))}
        subjects={subjects.map((s) => ({ value: s.id, label: s.name }))}
        showStudentFilter={!isStudent}
      />

      {/* Assignment list */}
      {assignments.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">
            No assignments found
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            {isStudent
              ? "You don't have any assignments yet."
              : "Create your first assignment to get started."}
          </p>
          {!isStudent && (
            <Link
              href="/assignments/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-full transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Assignment
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              showStudent={!isStudent}
            />
          ))}
        </div>
      )}
    </div>
  );
}
