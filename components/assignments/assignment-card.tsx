import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { Clock, AlertCircle } from "lucide-react";
import { PRIORITY_COLORS, ASSIGNMENT_CATEGORIES } from "@/lib/constants";

const categoryLabels = Object.fromEntries(ASSIGNMENT_CATEGORIES.map((c) => [c.value, c.label]));

interface AssignmentCardProps {
  assignment: {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: Date | null;
    estimatedMinutes: number | null;
    gradeLabel?: string | null;
    category?: string | null;
    student: { id: string; name: string } | null;
    subject: { name: string; color: string | null } | null;
  };
  showStudent?: boolean;
  backPath?: string;
  selectable?: boolean;
  selected?: boolean;
  onToggle?: (id: string) => void;
  disabled?: boolean;
}

export function AssignmentCard({ assignment, showStudent = true, backPath, selectable, selected, onToggle, disabled }: AssignmentCardProps) {
  const isOverdue =
    assignment.dueDate &&
    new Date(assignment.dueDate) < new Date() &&
    assignment.status !== "COMPLETED";

  const dueLabel = assignment.dueDate
    ? new Date(assignment.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  const priorityStyle =
    PRIORITY_COLORS[assignment.priority as keyof typeof PRIORITY_COLORS];

  const cardContent = (
    <div className={`bg-white rounded-2xl border p-4 transition-all duration-200 ${
      disabled
        ? "border-[#EDE9E3] opacity-50"
        : selectable
          ? selected
            ? "border-teal-400 bg-teal-50/30 shadow-sm"
            : "border-[#EDE9E3] hover:border-teal-200 cursor-pointer"
          : "border-[#EDE9E3] hover:shadow-sm hover:border-teal-200 cursor-pointer"
    }`}>
      <div className="flex items-start gap-3">
        {selectable && !disabled && (
          <div className="shrink-0 mt-1">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              selected
                ? "bg-teal-600 border-teal-600"
                : "border-slate-300 bg-white"
            }`}>
              {selected && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
        )}
        {assignment.subject && (
          <div
            className="w-1 h-12 rounded-full shrink-0 mt-0.5"
            style={{ backgroundColor: assignment.subject.color || "#94a3b8" }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <p className="font-medium text-slate-900 truncate">
              {assignment.title}
            </p>
            <StatusBadge status={assignment.status} />
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {showStudent && assignment.student && (
              <span className="text-xs text-slate-500">
                {assignment.student.name}
              </span>
            )}
            {showStudent && assignment.student && assignment.subject && (
              <span className="text-slate-300">·</span>
            )}
            {assignment.subject && (
              <span className="text-xs text-slate-500">
                {assignment.subject.name}
              </span>
            )}
            {assignment.category && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600">
                  {categoryLabels[assignment.category] || assignment.category}
                </span>
              </>
            )}
            {dueLabel && (
              <>
                <span className="text-slate-300">·</span>
                <span
                  className={`text-xs flex items-center gap-1 ${
                    isOverdue ? "text-rose-600 font-medium" : "text-slate-500"
                  }`}
                >
                  {isOverdue && <AlertCircle className="w-3 h-3" />}
                  Due {dueLabel}
                </span>
              </>
            )}
            {assignment.estimatedMinutes && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {assignment.estimatedMinutes}m
                </span>
              </>
            )}
            {priorityStyle && assignment.priority !== "MEDIUM" && (
              <>
                <span className="text-slate-300">·</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${priorityStyle.bg} ${priorityStyle.text}`}
                >
                  {assignment.priority.charAt(0) + assignment.priority.slice(1).toLowerCase()}
                </span>
              </>
            )}
            {assignment.gradeLabel && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-green-50 text-green-700">
                  {assignment.gradeLabel}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (selectable && !disabled) {
    return (
      <div onClick={() => onToggle?.(assignment.id)}>
        {cardContent}
      </div>
    );
  }

  if (disabled) {
    return cardContent;
  }

  return (
    <Link href={`/assignments/${assignment.id}${backPath ? `?from=${encodeURIComponent(backPath)}` : ""}`}>
      {cardContent}
    </Link>
  );
}
