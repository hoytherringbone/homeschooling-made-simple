"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAttendanceLog } from "@/lib/actions/attendance";
import { deleteAttendanceLog } from "@/lib/actions/attendance";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";

interface AttendanceLogRowProps {
  log: {
    id: string;
    date: string;
    hoursLogged: number;
    studentId: string;
    studentName: string;
    subjectId: string | null;
    subjectName: string;
    notes: string | null;
  };
  students: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
}

export function AttendanceLogRow({ log, students, subjects }: AttendanceLogRowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(log.date);
  const [hours, setHours] = useState(String(log.hoursLogged));
  const [studentId, setStudentId] = useState(log.studentId);
  const [subjectId, setSubjectId] = useState(log.subjectId || "");
  const [notes, setNotes] = useState(log.notes || "");

  const inputClass =
    "rounded-lg border border-[#EDE9E3] bg-white px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all";

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateAttendanceLog({
        id: log.id,
        date,
        hoursLogged: parseFloat(hours),
        studentId,
        subjectId: subjectId || undefined,
        notes: notes || undefined,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Log updated");
        setEditing(false);
        router.refresh();
      }
    });
  };

  const handleCancel = () => {
    setDate(log.date);
    setHours(String(log.hoursLogged));
    setStudentId(log.studentId);
    setSubjectId(log.subjectId || "");
    setNotes(log.notes || "");
    setEditing(false);
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteAttendanceLog(log.id);
      router.refresh();
    });
  };

  if (editing) {
    return (
      <tr className="border-b border-[#EDE9E3] last:border-0 bg-teal-50/30">
        <td className="px-5 py-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} required />
        </td>
        <td className="px-5 py-2">
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className={inputClass} required>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </td>
        <td className="px-5 py-2">
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className={inputClass}>
            <option value="">General</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </td>
        <td className="px-5 py-2">
          <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} min="0.25" max="12" step="0.25" className={`${inputClass} w-16`} required />
        </td>
        <td className="px-5 py-2">
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" className={inputClass} maxLength={500} />
        </td>
        <td className="px-5 py-2">
          <div className="flex items-center gap-1">
            <button onClick={handleSave} disabled={isPending} className="p-1 text-teal-600 hover:bg-teal-100 rounded transition-colors disabled:opacity-50" title="Save">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleCancel} className="p-1 text-slate-400 hover:bg-slate-100 rounded transition-colors" title="Cancel">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-[#EDE9E3] last:border-0">
      <td className="px-5 py-3 text-slate-700">
        {new Date(log.date).toLocaleDateString()}
      </td>
      <td className="px-5 py-3 text-slate-900 font-medium">
        {log.studentName}
      </td>
      <td className="px-5 py-3 text-slate-600">
        {log.subjectName}
      </td>
      <td className="px-5 py-3 text-slate-900 font-medium">
        {log.hoursLogged}h
      </td>
      <td className="px-5 py-3 text-slate-500 max-w-[200px] truncate">
        {log.notes || "\u2014"}
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setEditing(true)}
            className="text-slate-400 hover:text-teal-600 transition-colors"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-50"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
