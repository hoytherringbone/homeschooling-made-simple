"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateAssignmentStatus } from "@/lib/actions/assignments";
import { VALID_TRANSITIONS, LETTER_GRADES } from "@/lib/constants";

interface StatusActionsProps {
  assignmentId: string;
  currentStatus: string;
  userRole: string;
}

const ACTION_STYLES: Record<string, string> = {
  COMPLETED: "bg-teal-600 hover:bg-teal-700 text-white",
  ASSIGNED: "border border-rose-300 text-rose-600 hover:bg-rose-50",
};

function getActionLabel(status: string, userRole: string): string {
  if (status === "COMPLETED") {
    return userRole === "STUDENT" ? "Submit" : "Mark Complete";
  }
  if (status === "ASSIGNED") {
    return "Return with Feedback";
  }
  return status;
}

export function StatusActions({ assignmentId, currentStatus, userRole }: StatusActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnComment, setReturnComment] = useState("");
  const [gradeLabel, setGradeLabel] = useState("");

  const transition = VALID_TRANSITIONS[currentStatus];
  if (!transition) return null;

  const allowedStatuses = transition.roles.includes(userRole) ? transition.to : [];
  if (allowedStatuses.length === 0) return null;

  const handleTransition = (newStatus: string) => {
    if (newStatus === "ASSIGNED") {
      setShowReturnForm(true);
      return;
    }

    startTransition(async () => {
      const selectedGrade = LETTER_GRADES.find((g) => g.label === gradeLabel);
      const result = await updateAssignmentStatus({
        assignmentId,
        newStatus: newStatus as "ASSIGNED" | "COMPLETED",
        gradeLabel: gradeLabel || undefined,
        gradeValue: selectedGrade?.value ?? undefined,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          userRole === "STUDENT" ? "Assignment submitted!" : "Assignment updated!"
        );
      }
    });
  };

  const handleReturn = () => {
    if (!returnComment.trim()) {
      toast.error("Please provide feedback");
      return;
    }

    startTransition(async () => {
      const result = await updateAssignmentStatus({
        assignmentId,
        newStatus: "ASSIGNED",
        comment: returnComment,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Assignment returned with feedback");
        setShowReturnForm(false);
        setReturnComment("");
      }
    });
  };

  // Parent/admin viewing a completed assignment: show grade dropdown + return
  const isParentCompleting = allowedStatuses.includes("COMPLETED") && (userRole === "PARENT" || userRole === "SUPER_ADMIN");

  const handleGradeChange = (label: string) => {
    setGradeLabel(label);
    if (!label) return;
    const selectedGrade = LETTER_GRADES.find((g) => g.label === label);
    startTransition(async () => {
      const result = await updateAssignmentStatus({
        assignmentId,
        newStatus: "COMPLETED",
        gradeLabel: label,
        gradeValue: selectedGrade?.value ?? undefined,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Grade saved: ${label}`);
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {isParentCompleting ? (
          <>
            <label className="text-sm font-medium text-slate-600">Grade:</label>
            <select
              value={gradeLabel}
              onChange={(e) => handleGradeChange(e.target.value)}
              disabled={isPending}
              className="rounded-full border border-[#EDE9E3] bg-white pl-4 pr-10 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-300 transition-all disabled:opacity-50"
            >
              <option value="">No grade</option>
              {LETTER_GRADES.map((g) => (
                <option key={g.label} value={g.label}>
                  {g.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => handleTransition("ASSIGNED")}
              disabled={isPending}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-50 ${ACTION_STYLES["ASSIGNED"]}`}
            >
              {isPending ? "Updating..." : "Return with Feedback"}
            </button>
          </>
        ) : (
          allowedStatuses.map((status) => (
            <button
              key={status}
              onClick={() => handleTransition(status)}
              disabled={isPending}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
                ACTION_STYLES[status] || "bg-slate-100 text-slate-700"
              }`}
            >
              {isPending ? "Updating..." : getActionLabel(status, userRole)}
            </button>
          ))
        )}
      </div>

      {showReturnForm && (
        <div className="bg-rose-50 rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium text-rose-700">
            What needs to be revised?
          </p>
          <textarea
            value={returnComment}
            onChange={(e) => setReturnComment(e.target.value)}
            placeholder="Provide feedback for the student..."
            rows={3}
            className="w-full rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition-all"
          />
          <div className="flex gap-2">
            <button
              onClick={handleReturn}
              disabled={isPending}
              className="px-4 py-2 rounded-full text-sm font-medium bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:opacity-50"
            >
              {isPending ? "Sending..." : "Send Feedback"}
            </button>
            <button
              onClick={() => {
                setShowReturnForm(false);
                setReturnComment("");
              }}
              className="px-4 py-2 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
