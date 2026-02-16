"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAttendanceLog } from "@/lib/actions/attendance";
import { Plus } from "lucide-react";

interface AttendanceFormProps {
  students: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
}

export function AttendanceForm({ students, subjects }: AttendanceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [hours, setHours] = useState("1");
  const [studentId, setStudentId] = useState(students[0]?.id || "");
  const [subjectId, setSubjectId] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await createAttendanceLog({
        date,
        hoursLogged: parseFloat(hours),
        studentId,
        subjectId: subjectId || undefined,
        notes: notes || undefined,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setNotes("");
        router.refresh();
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-[#EDE9E3] p-5"
    >
      <h2 className="text-sm font-semibold text-slate-900 mb-4">Log Hours</h2>

      {error && (
        <p className="text-sm text-rose-600 mb-3">{error}</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-[#EDE9E3] bg-white px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="text-xs text-slate-500 mb-1 block">Student</label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full rounded-xl border border-[#EDE9E3] bg-white px-3 py-2 text-sm"
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
          <label className="text-xs text-slate-500 mb-1 block">Subject</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full rounded-xl border border-[#EDE9E3] bg-white px-3 py-2 text-sm"
          >
            <option value="">All / General</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-500 mb-1 block">Hours</label>
          <input
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            min="0.25"
            max="12"
            step="0.25"
            className="w-full rounded-xl border border-[#EDE9E3] bg-white px-3 py-2 text-sm"
            required
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-full px-4 py-2 transition-colors disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-1.5">
              <Plus className="w-4 h-4" />
              {isPending ? "Logging..." : "Log"}
            </span>
          </button>
        </div>
      </div>

      <div className="mt-3">
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="w-full rounded-xl border border-[#EDE9E3] bg-white px-3 py-2 text-sm"
          maxLength={500}
        />
      </div>
    </form>
  );
}
