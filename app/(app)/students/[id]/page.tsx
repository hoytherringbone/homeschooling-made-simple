import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Plus, ClipboardList } from "lucide-react";
import { AssignmentCard } from "@/components/assignments/assignment-card";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) redirect("/login");
  if (session.user.role === "STUDENT") redirect("/dashboard");

  const { id } = await params;

  const student = await db.student.findFirst({
    where: { id, familyId: session.user.familyId },
    include: {
      assignments: {
        include: {
          student: { select: { id: true, name: true } },
          subject: { select: { name: true, color: true } },
        },
        orderBy: [{ dueDate: "asc" }, { assignedDate: "desc" }],
      },
    },
  });

  if (!student) notFound();

  const total = student.assignments.length;
  const completed = student.assignments.filter(
    (a) => a.status === "COMPLETED"
  ).length;
  const submitted = student.assignments.filter(
    (a) => a.status === "SUBMITTED"
  ).length;
  const inProgress = student.assignments.filter(
    (a) => a.status === "IN_PROGRESS"
  ).length;
  const assigned = student.assignments.filter(
    (a) => a.status === "ASSIGNED"
  ).length;
  const returned = student.assignments.filter(
    (a) => a.status === "RETURNED"
  ).length;

  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
        <div className="grid grid-cols-5 gap-3 mt-6">
          {[
            { label: "Assigned", value: assigned, color: "bg-slate-50 text-slate-700" },
            { label: "In Progress", value: inProgress, color: "bg-blue-50 text-blue-700" },
            { label: "Submitted", value: submitted, color: "bg-amber-50 text-amber-700" },
            { label: "Returned", value: returned, color: "bg-rose-50 text-rose-700" },
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

      {/* Assignments */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Assignments
        </h2>
        {student.assignments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">
              No assignments yet for {student.name}.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {student.assignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                showStudent={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
