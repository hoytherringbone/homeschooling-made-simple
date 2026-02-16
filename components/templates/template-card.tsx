"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteTemplate } from "@/lib/actions/templates";
import { Clock, Pencil, Trash2, Plus } from "lucide-react";
import Link from "next/link";

interface TemplateCardProps {
  template: {
    id: string;
    title: string;
    description: string | null;
    estimatedMinutes: number | null;
    subject: { name: string; color: string | null } | null;
  };
  onEdit: (id: string) => void;
}

export function TemplateCard({ template, onEdit }: TemplateCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Delete this template?")) return;
    startTransition(async () => {
      const result = await deleteTemplate(template.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Template deleted");
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-[#EDE9E3] p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {template.subject && (
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  backgroundColor: template.subject.color || "#94a3b8",
                }}
              />
            )}
            <h3 className="font-medium text-slate-900 truncate">
              {template.title}
            </h3>
          </div>
          {template.description && (
            <p className="text-sm text-slate-500 line-clamp-2">
              {template.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {template.subject && (
            <span>{template.subject.name}</span>
          )}
          {template.estimatedMinutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {template.estimatedMinutes}m
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Link
            href={`/assignments/new?templateId=${template.id}`}
            className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
            title="Use template"
          >
            <Plus className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onEdit(template.id)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
