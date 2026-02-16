"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteGoal } from "@/lib/actions/goals";
import { Trash2, Target } from "lucide-react";

interface GoalCardProps {
  goal: {
    id: string;
    title: string;
    targetCount: number;
    currentCount: number;
    termStart: Date;
    termEnd: Date;
    studentName: string;
    subjectName: string | null;
    subjectColor: string | null;
  };
  showDelete?: boolean;
}

export function GoalCard({ goal, showDelete = true }: GoalCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const rate = Math.round((goal.currentCount / goal.targetCount) * 100);
  const isComplete = goal.currentCount >= goal.targetCount;
  const now = new Date();
  const isExpired = new Date(goal.termEnd) < now && !isComplete;

  let statusColor = "text-teal-600 bg-teal-50"; // on track
  if (isComplete) statusColor = "text-green-600 bg-green-50";
  else if (isExpired) statusColor = "text-rose-600 bg-rose-50";
  else if (rate < 30) statusColor = "text-amber-600 bg-amber-50";

  let statusLabel = "On Track";
  if (isComplete) statusLabel = "Completed";
  else if (isExpired) statusLabel = "Expired";
  else if (rate < 30) statusLabel = "At Risk";

  return (
    <div className="bg-white rounded-2xl border border-[#EDE9E3] p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Target className="w-4 h-4 text-teal-600 shrink-0" />
          <h3 className="font-medium text-slate-900 truncate">{goal.title}</h3>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${statusColor}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
          {goal.studentName}
        </span>
        {goal.subjectName && (
          <span
            className="text-xs text-white px-2 py-0.5 rounded-full"
            style={{ backgroundColor: goal.subjectColor || "#94a3b8" }}
          >
            {goal.subjectName}
          </span>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-slate-900">
            {goal.currentCount} of {goal.targetCount}
          </span>
          <span className="text-xs text-slate-500">{rate}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isComplete ? "bg-green-500" : "bg-teal-600"
            }`}
            style={{ width: `${Math.min(rate, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {new Date(goal.termStart).toLocaleDateString()} –{" "}
          {new Date(goal.termEnd).toLocaleDateString()}
        </span>
        {showDelete && (
          <button
            onClick={() => {
              startTransition(async () => {
                await deleteGoal(goal.id);
                router.refresh();
              });
            }}
            disabled={isPending}
            className="text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-50"
            title="Delete goal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
