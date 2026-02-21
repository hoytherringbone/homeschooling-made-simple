"use client";

import { useState, useTransition, type ReactNode } from "react";
import { CalendarClock } from "lucide-react";
import { AssignmentCard } from "@/components/assignments/assignment-card";
import { bulkShiftDueDates } from "@/lib/actions/assignments";

interface SerializedAssignment {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  estimatedMinutes: number | null;
  gradeLabel?: string | null;
  category?: string | null;
  student: { id: string; name: string } | null;
  subject: { name: string; color: string | null } | null;
}

interface CatchUpFlowProps {
  assignments: SerializedAssignment[];
  studentId: string;
  backPath: string;
  filters?: ReactNode;
}

type Mode = "idle" | "selecting" | "confirming";

export function CatchUpFlow({ assignments, studentId, backPath, filters }: CatchUpFlowProps) {
  const [mode, setMode] = useState<Mode>("idle");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [days, setDays] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // Only ASSIGNED assignments with a dueDate are eligible
  const eligible = assignments.filter(
    (a) => a.status === "ASSIGNED" && a.dueDate
  );

  const handleToggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selected.size === eligible.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(eligible.map((a) => a.id)));
    }
  };

  const handleCancel = () => {
    setMode("idle");
    setSelected(new Set());
    setDays("");
    setError("");
  };

  const handleSubmit = () => {
    const daysNum = parseInt(days, 10);
    if (!daysNum || daysNum < 1 || daysNum > 365) {
      setError("Enter a number between 1 and 365");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await bulkShiftDueDates(Array.from(selected), daysNum);
      if (result.error) {
        setError(result.error);
      } else {
        handleCancel();
      }
    });
  };

  // Deserialize dates for AssignmentCard
  const toCardAssignment = (a: SerializedAssignment) => ({
    ...a,
    dueDate: a.dueDate ? new Date(a.dueDate) : null,
  });

  if (mode === "idle") {
    return (
      <div>
        {/* Filters row with Catch Up button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">{filters}</div>
          <button
            onClick={() => setMode("selecting")}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#EDE9E3] text-sm font-medium text-slate-700 rounded-full hover:border-teal-300 hover:text-teal-700 transition-colors shrink-0 ml-3"
          >
            <CalendarClock className="w-4 h-4" />
            Catch Up
          </button>
        </div>

        <h2 className="text-lg font-semibold text-slate-900 mb-3">Assignments</h2>
        {assignments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-slate-500">No assignments to display.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((a) => (
              <AssignmentCard
                key={a.id}
                assignment={toCardAssignment(a)}
                showStudent={false}
                backPath={backPath}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (mode === "selecting") {
    return (
      <div>
        {/* Selection header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Select Assignments</h2>
            <span className="text-sm text-slate-500">{selected.size} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              {selected.size === eligible.length ? "Deselect All" : "Select All"}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-slate-600 border border-[#EDE9E3] rounded-full hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setMode("confirming")}
              disabled={selected.size === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-full hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {assignments.map((a) => {
            const isEligible = a.status === "ASSIGNED" && a.dueDate;
            return (
              <AssignmentCard
                key={a.id}
                assignment={toCardAssignment(a)}
                showStudent={false}
                selectable={!!isEligible}
                selected={selected.has(a.id)}
                onToggle={handleToggle}
                disabled={!isEligible}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // confirming mode
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Push Back Due Dates</h2>
        <p className="text-sm text-slate-500">
          {selected.size} assignment{selected.size !== 1 ? "s" : ""} selected
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#EDE9E3] p-6 mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          How many days to push back?
        </label>
        <input
          type="number"
          min={1}
          max={365}
          value={days}
          onChange={(e) => {
            setDays(e.target.value);
            setError("");
          }}
          placeholder="e.g. 3"
          className="w-32 rounded-xl border border-[#EDE9E3] px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
        />

        {days && parseInt(days) > 0 && (
          <p className="text-sm text-slate-500 mt-3">
            This will push back {selected.size} assignment{selected.size !== 1 ? "s" : ""} by {days} day{parseInt(days) !== 1 ? "s" : ""}.
          </p>
        )}

        {error && (
          <p className="text-sm text-rose-600 mt-2">{error}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setMode("selecting");
            setDays("");
            setError("");
          }}
          className="px-4 py-2 text-sm font-medium text-slate-600 border border-[#EDE9E3] rounded-full hover:bg-slate-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isPending || !days}
          className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-full hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Updating..." : "Update Dates"}
        </button>
      </div>
    </div>
  );
}
