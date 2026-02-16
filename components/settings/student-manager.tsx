"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createStudent, updateStudent, deleteStudent } from "@/lib/actions/settings";
import { GRADE_LEVELS } from "@/lib/constants";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

interface Student {
  id: string;
  name: string;
  gradeLevel: string | null;
}

export function StudentManager({ students }: { students: Student[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await createStudent({
        name: name.trim(),
        gradeLevel: gradeLevel || undefined,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Student added");
        setName("");
        setGradeLevel("");
        setShowAdd(false);
        router.refresh();
      }
    });
  };

  const handleUpdate = (id: string) => {
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await updateStudent({
        id,
        name: name.trim(),
        gradeLevel: gradeLevel || undefined,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Student updated");
        setEditingId(null);
        setName("");
        setGradeLevel("");
        router.refresh();
      }
    });
  };

  const handleDelete = (id: string, studentName: string) => {
    if (!confirm(`Delete "${studentName}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteStudent(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Student deleted");
        router.refresh();
      }
    });
  };

  const startEdit = (student: Student) => {
    setEditingId(student.id);
    setName(student.name);
    setGradeLevel(student.gradeLevel || "");
    setShowAdd(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowAdd(false);
    setName("");
    setGradeLevel("");
  };

  const inputClass =
    "rounded-xl border border-[#EDE9E3] bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all";

  const editRow = (onSubmit: () => void) => (
    <div className="flex items-center gap-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Student name"
        className={`flex-1 ${inputClass}`}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit();
          if (e.key === "Escape") cancelEdit();
        }}
      />
      <select
        value={gradeLevel}
        onChange={(e) => setGradeLevel(e.target.value)}
        className={inputClass}
      >
        <option value="">Grade</option>
        {GRADE_LEVELS.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
      <button
        onClick={onSubmit}
        disabled={isPending || !name.trim()}
        className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-50"
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        onClick={cancelEdit}
        className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-3">
      {students.map((student) => (
        <div key={student.id}>
          {editingId === student.id ? (
            editRow(() => handleUpdate(student.id))
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-white">
                  {student.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <span className="text-sm text-slate-900">{student.name}</span>
                {student.gradeLevel && (
                  <span className="text-xs text-slate-500 ml-2">
                    {student.gradeLevel} Grade
                  </span>
                )}
              </div>
              <button
                onClick={() => startEdit(student)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(student.id, student.name)}
                disabled={isPending}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ))}

      {showAdd
        ? editRow(handleAdd)
        : (
          <button
            onClick={() => {
              setShowAdd(true);
              setEditingId(null);
              setName("");
              setGradeLevel("");
            }}
            className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        )}
    </div>
  );
}
