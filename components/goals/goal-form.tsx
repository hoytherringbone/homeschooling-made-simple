"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGoal } from "@/lib/actions/goals";
import { Plus, X } from "lucide-react";

interface GoalFormProps {
  students: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
}

export function GoalForm({ students, subjects }: GoalFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const monthEnd = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  )
    .toISOString()
    .split("T")[0];

  const [title, setTitle] = useState("");
  const [targetCount, setTargetCount] = useState("10");
  const [studentId, setStudentId] = useState(students[0]?.id || "");
  const [subjectId, setSubjectId] = useState("");
  const [termStart, setTermStart] = useState(today);
  const [termEnd, setTermEnd] = useState(monthEnd);

  function reset() {
    setTitle("");
    setTargetCount("10");
    setStudentId(students[0]?.id || "");
    setSubjectId("");
    setTermStart(today);
    setTermEnd(monthEnd);
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await createGoal({
        title,
        targetCount: parseInt(targetCount),
        studentId,
        subjectId: subjectId || undefined,
        termStart,
        termEnd,
      });

      if (result.error) {
        setError(result.error);
      } else {
        reset();
        setOpen(false);
        router.refresh();
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-full px-4 py-2 transition-colors"
      >
        <Plus className="w-4 h-4" />
        New Goal
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-[#EDE9E3] p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Create Goal</h2>
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div>
        <label className="text-xs text-slate-500 mb-1 block">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Complete 10 math assignments"
          className="w-full rounded-xl border border-[#EDE9E3] bg-white px-4 py-2.5 text-sm"
          required
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Student</label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full rounded-xl border border-[#EDE9E3] bg-white px-3 py-2.5 text-sm"
            required
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-500 mb-1 block">
            Subject (optional)
          </label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full rounded-xl border border-[#EDE9E3] bg-white px-3 py-2.5 text-sm"
          >
            <option value="">Any subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-500 mb-1 block">Target</label>
          <input
            type="number"
            value={targetCount}
            onChange={(e) => setTargetCount(e.target.value)}
            min="1"
            max="999"
            className="w-full rounded-xl border border-[#EDE9E3] bg-white px-3 py-2.5 text-sm"
            required
          />
        </div>

        <div className="col-span-2 md:col-span-1" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">
            Start Date
          </label>
          <input
            type="date"
            value={termStart}
            onChange={(e) => setTermStart(e.target.value)}
            className="w-full rounded-xl border border-[#EDE9E3] bg-white px-3 py-2.5 text-sm"
            required
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">End Date</label>
          <input
            type="date"
            value={termEnd}
            onChange={(e) => setTermEnd(e.target.value)}
            className="w-full rounded-xl border border-[#EDE9E3] bg-white px-3 py-2.5 text-sm"
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-full px-5 py-2 transition-colors disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create Goal"}
        </button>
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
