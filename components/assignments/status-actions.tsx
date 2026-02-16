"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateAssignmentStatus } from "@/lib/actions/assignments";
import { VALID_TRANSITIONS } from "@/lib/constants";

interface StatusActionsProps {
  assignmentId: string;
  currentStatus: string;
  userRole: string;
}

const ACTION_LABELS: Record<string, string> = {
  IN_PROGRESS: "Start Working",
  SUBMITTED: "Submit",
  COMPLETED: "Approve",
  RETURNED: "Return with Feedback",
};

const ACTION_STYLES: Record<string, string> = {
  IN_PROGRESS: "bg-blue-600 hover:bg-blue-700 text-white",
  SUBMITTED: "bg-teal-600 hover:bg-teal-700 text-white",
  COMPLETED: "bg-green-600 hover:bg-green-700 text-white",
  RETURNED: "border border-rose-300 text-rose-600 hover:bg-rose-50",
};

export function StatusActions({ assignmentId, currentStatus, userRole }: StatusActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnComment, setReturnComment] = useState("");

  const transition = VALID_TRANSITIONS[currentStatus];
  if (!transition) return null;

  const allowedStatuses = transition.roles.includes(userRole) ? transition.to : [];
  if (allowedStatuses.length === 0) return null;

  const handleTransition = (newStatus: string) => {
    if (newStatus === "RETURNED") {
      setShowReturnForm(true);
      return;
    }

    startTransition(async () => {
      const result = await updateAssignmentStatus({
        assignmentId,
        newStatus: newStatus as "IN_PROGRESS" | "SUBMITTED" | "RETURNED" | "COMPLETED",
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Status updated to ${newStatus.replace("_", " ").toLowerCase()}`);
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
        newStatus: "RETURNED",
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

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {allowedStatuses.map((status) => (
          <button
            key={status}
            onClick={() => handleTransition(status)}
            disabled={isPending}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
              ACTION_STYLES[status] || "bg-slate-100 text-slate-700"
            }`}
          >
            {isPending ? "Updating..." : ACTION_LABELS[status] || status}
          </button>
        ))}
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
