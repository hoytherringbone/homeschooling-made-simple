import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AssignmentForm } from "@/components/assignments/assignment-form";

interface PageProps {
  searchParams: Promise<{ studentId?: string }>;
}

export default async function NewAssignmentPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) redirect("/login");
  if (session.user.role === "STUDENT") redirect("/assignments");

  const params = await searchParams;
  const familyId = session.user.familyId;

  const [students, subjects, templates] = await Promise.all([
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
    db.assignmentTemplate.findMany({
      where: { familyId },
      select: {
        id: true,
        title: true,
        description: true,
        subjectId: true,
        estimatedMinutes: true,
      },
      orderBy: { title: "asc" },
    }),
  ]);

  if (students.length === 0) {
    redirect("/onboarding");
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/assignments"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to assignments
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">New Assignment</h1>
        <p className="text-sm text-slate-500 mt-1">
          Create an assignment for one or more students.
        </p>
      </div>

      <AssignmentForm
        students={students}
        subjects={subjects}
        templates={templates}
        preselectedStudentId={params.studentId}
      />
    </div>
  );
}
