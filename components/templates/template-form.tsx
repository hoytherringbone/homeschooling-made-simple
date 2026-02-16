"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createTemplate, updateTemplate } from "@/lib/actions/templates";

interface Subject {
  id: string;
  name: string;
}

interface TemplateFormProps {
  subjects: Subject[];
  template?: {
    id: string;
    title: string;
    description: string | null;
    subjectId: string | null;
    estimatedMinutes: number | null;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export function TemplateForm({
  subjects,
  template,
  onSuccess,
  onCancel,
}: TemplateFormProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(template?.title || "");
  const [description, setDescription] = useState(template?.description || "");
  const [subjectId, setSubjectId] = useState(template?.subjectId || "");
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    template?.estimatedMinutes ? String(template.estimatedMinutes) : ""
  );

  const isEditing = !!template;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    startTransition(async () => {
      const data = {
        title: title.trim(),
        description: description.trim() || undefined,
        subjectId: subjectId || undefined,
        estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : undefined,
      };

      const result = isEditing
        ? await updateTemplate({ id: template.id, ...data })
        : await createTemplate(data);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(isEditing ? "Template updated" : "Template created");
        onSuccess();
      }
    });
  };

  const inputClass =
    "w-full rounded-xl border border-[#EDE9E3] bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="tpl-title" className={labelClass}>
          Title <span className="text-rose-500">*</span>
        </label>
        <input
          id="tpl-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Weekly Reading Journal"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="tpl-description" className={labelClass}>
          Description
        </label>
        <textarea
          id="tpl-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Default instructions for this template..."
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="tpl-subject" className={labelClass}>
            Subject
          </label>
          <select
            id="tpl-subject"
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
          <label htmlFor="tpl-minutes" className={labelClass}>
            Est. minutes
          </label>
          <input
            id="tpl-minutes"
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

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-full transition-colors disabled:opacity-50"
        >
          {isPending
            ? isEditing
              ? "Saving..."
              : "Creating..."
            : isEditing
            ? "Save Changes"
            : "Create Template"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
