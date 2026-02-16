"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createAssignment } from "@/lib/actions/assignments";
import { PRIORITY_OPTIONS } from "@/lib/constants";

interface Student {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Template {
  id: string;
  title: string;
  description: string | null;
  subjectId: string | null;
  estimatedMinutes: number | null;
}

interface AssignmentFormProps {
  students: Student[];
  subjects: Subject[];
  templates: Template[];
  preselectedStudentId?: string;
}

export function AssignmentForm({
  students,
  subjects,
  templates,
  preselectedStudentId,
}: AssignmentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>(
    preselectedStudentId ? [preselectedStudentId] : []
  );
  const [subjectId, setSubjectId] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
    setErrors((prev) => ({ ...prev, studentIds: "" }));
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    setTitle(template.title);
    setDescription(template.description || "");
    if (template.subjectId) setSubjectId(template.subjectId);
    if (template.estimatedMinutes)
      setEstimatedMinutes(String(template.estimatedMinutes));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic client validation
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (selectedStudents.length === 0)
      newErrors.studentIds = "Select at least one student";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    startTransition(async () => {
      const result = await createAssignment({
        title: title.trim(),
        description: description.trim() || undefined,
        studentIds: selectedStudents,
        subjectId: subjectId || undefined,
        priority: priority as "LOW" | "MEDIUM" | "HIGH",
        dueDate: dueDate || undefined,
        estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : undefined,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          selectedStudents.length > 1
            ? `Assignment created for ${selectedStudents.length} students`
            : "Assignment created"
        );
        router.push("/assignments");
      }
    });
  };

  const inputClass =
    "w-full rounded-xl border border-[#EDE9E3] bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Template pre-fill */}
      {templates.length > 0 && (
        <div>
          <label className={labelClass}>Start from template</label>
          <select
            onChange={(e) => {
              if (e.target.value) applyTemplate(e.target.value);
            }}
            className={inputClass}
            defaultValue=""
          >
            <option value="">Choose a template...</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className={labelClass}>
          Title <span className="text-rose-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setErrors((prev) => ({ ...prev, title: "" }));
          }}
          placeholder="e.g., Chapter 5 Reading Comprehension"
          className={inputClass}
        />
        {errors.title && (
          <p className="text-xs text-rose-600 mt-1">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Instructions or details for the student..."
          rows={4}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Students */}
      <div>
        <label className={labelClass}>
          Assign to <span className="text-rose-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {students.map((student) => {
            const selected = selectedStudents.includes(student.id);
            return (
              <button
                key={student.id}
                type="button"
                onClick={() => toggleStudent(student.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selected
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {student.name}
              </button>
            );
          })}
        </div>
        {errors.studentIds && (
          <p className="text-xs text-rose-600 mt-1">{errors.studentIds}</p>
        )}
      </div>

      {/* Subject + Priority row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="subject" className={labelClass}>
            Subject
          </label>
          <select
            id="subject"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className={inputClass}
          >
            <option value="">No subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="priority" className={labelClass}>
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className={inputClass}
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Due date + Estimated time row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="dueDate" className={labelClass}>
            Due date
          </label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="estimatedMinutes" className={labelClass}>
            Estimated time (minutes)
          </label>
          <input
            id="estimatedMinutes"
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
          {isPending ? "Creating..." : "Create Assignment"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
