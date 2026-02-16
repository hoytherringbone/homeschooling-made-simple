import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { StatusActions } from "@/components/assignments/status-actions";
import { CommentThread } from "@/components/assignments/comment-thread";
import { CommentForm } from "@/components/assignments/comment-form";
import { DeleteAssignmentButton } from "@/components/assignments/delete-assignment-button";
import { PRIORITY_COLORS } from "@/lib/constants";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AssignmentDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) redirect("/login");

  const { id } = await params;

  const assignment = await db.assignment.findFirst({
    where: { id, familyId: session.user.familyId },
    include: {
      student: { select: { id: true, name: true, gradeLevel: true } },
      subject: { select: { name: true, color: true } },
      comments: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!assignment) notFound();

  // Students can only view their own assignments
  if (session.user.role === "STUDENT") {
    const studentProfile = await db.student.findFirst({
      where: { userId: session.user.id, familyId: session.user.familyId },
      select: { id: true },
    });
    if (!studentProfile || studentProfile.id !== assignment.studentId) {
      notFound();
    }
  }

  const isParent =
    session.user.role === "PARENT" || session.user.role === "SUPER_ADMIN";

  const isOverdue =
    assignment.dueDate &&
    new Date(assignment.dueDate) < new Date() &&
    assignment.status !== "COMPLETED";

  const priorityStyle =
    PRIORITY_COLORS[assignment.priority as keyof typeof PRIORITY_COLORS];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back link */}
      <Link
        href="/assignments"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to assignments
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-[#EDE9E3] p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              {assignment.subject && (
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: `${assignment.subject.color}15`,
                    color: assignment.subject.color || "#64748b",
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: assignment.subject.color || "#94a3b8",
                    }}
                  />
                  {assignment.subject.name}
                </span>
              )}
              {priorityStyle && assignment.priority !== "MEDIUM" && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyle.bg} ${priorityStyle.text}`}
                >
                  {assignment.priority.charAt(0) +
                    assignment.priority.slice(1).toLowerCase()}{" "}
                  Priority
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {assignment.title}
            </h1>
          </div>
          <StatusBadge status={assignment.status} />
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 flex-wrap text-sm text-slate-500">
          <span>
            Assigned to{" "}
            <span className="font-medium text-slate-700">
              {assignment.student.name}
            </span>
          </span>
          {assignment.dueDate && (
            <span
              className={`flex items-center gap-1 ${
                isOverdue ? "text-rose-600 font-medium" : ""
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Due{" "}
              {new Date(assignment.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              {isOverdue && " (overdue)"}
            </span>
          )}
          {assignment.estimatedMinutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {assignment.estimatedMinutes} min
            </span>
          )}
          <span className="text-slate-400">
            Created{" "}
            {new Date(assignment.assignedDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Description */}
        {assignment.description && (
          <div className="pt-2 border-t border-[#EDE9E3]">
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {assignment.description}
            </p>
          </div>
        )}
      </div>

      {/* Status actions */}
      <StatusActions
        assignmentId={assignment.id}
        currentStatus={assignment.status}
        userRole={session.user.role}
      />

      {/* Comments section */}
      <div className="bg-white rounded-2xl border border-[#EDE9E3] p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Comments</h2>
        <CommentThread comments={assignment.comments} />
        <div className="pt-3 border-t border-[#EDE9E3]">
          <CommentForm assignmentId={assignment.id} />
        </div>
      </div>

      {/* Delete (parent only) */}
      {isParent && (
        <div className="flex justify-end">
          <DeleteAssignmentButton assignmentId={assignment.id} />
        </div>
      )}
    </div>
  );
}
