"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateAssignment } from "@/lib/actions/assignments";
import { PRIORITY_OPTIONS, ASSIGNMENT_CATEGORIES } from "@/lib/constants";

interface Student {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  studentId: string;
  subjectId: string | null;
  category: string | null;
  priority: string;
  dueDate: Date | null;
  estimatedMinutes: number | null;
}

interface EditAssignmentFormProps {
  assignment: Assignment;
  students: Student[];
  subjects: Subject[];
  onCancel: () => void;
}

export function EditAssignmentForm({ assignment, students, subjects, onCancel }: EditAssignmentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(assignment.title);
  const [description, setDescription] = useState(assignment.description || "");
  const [studentId, setStudentId] = useState(assignment.studentId);
  const [subjectId, setSubjectId] = useState(assignment.subjectId || "");
  const [category, setCategory] = useState(assignment.category || "");
  const [priority, setPriority] = useState(assignment.priority);
  const [dueDate, setDueDate] = useState(
    assignment.dueDate ? new Date(assignment.dueDate).toISOString().split("T")[0] : ""
  );
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    assignment.estimatedMinutes ? String(assignment.estimatedMinutes) : ""
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!studentId) newErrors.studentId = "Student is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    startTransition(async () => {
      const result = await updateAssignment({
        assignmentId: assignment.id,
        title: title.trim(),
        description: description.trim() || undefined,
        studentId,
        subjectId: subjectId || undefined,
        category: (category || undefined) as "TEST" | "QUIZ" | "HOMEWORK" | "PROJECT" | undefined,
        priority: priority as "LOW" | "MEDIUM" | "HIGH",
        dueDate: dueDate || undefined,
        estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : undefined,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Assignment updated");
        onCancel();
        router.refresh();
      }
    });
  };

  const inputClass =
    "w-full rounded-xl border border-[#EDE9E3] bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label htmlFor="edit-title" className={labelClass}>
          Title <span className="text-rose-500">*</span>
        </label>
        <input
          id="edit-title"
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
          className={inputClass}
        />
        {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="edit-description" className={labelClass}>Description</label>
        <textarea
          id="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Student */}
      <div>
        <label htmlFor="edit-student" className={labelClass}>
          Assigned to <span className="text-rose-500">*</span>
        </label>
        <select
          id="edit-student"
          value={studentId}
          onChange={(e) => { setStudentId(e.target.value); setErrors((p) => ({ ...p, studentId: "" })); }}
          className={inputClass}
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {errors.studentId && <p className="text-xs text-rose-600 mt-1">{errors.studentId}</p>}
      </div>

      {/* Subject + Category + Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="edit-subject" className={labelClass}>Subject</label>
          <select
            id="edit-subject"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className={inputClass}
          >
            <option value="">No subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="edit-category" className={labelClass}>Category</label>
          <select
            id="edit-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            <option value="">No category</option>
            {ASSIGNMENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="edit-priority" className={labelClass}>Priority</label>
          <select
            id="edit-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className={inputClass}
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Due date + Estimated time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="edit-dueDate" className={labelClass}>Due date</label>
          <input
            id="edit-dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="edit-estimatedMinutes" className={labelClass}>Estimated time (minutes)</label>
          <input
            id="edit-estimatedMinutes"
            type="number"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(e.target.value)}
            placeholder="e.g., 30"
            min="1"
            max="480"
            className={inputClass}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-full transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
