"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText } from "lucide-react";
import { TemplateCard } from "@/components/templates/template-card";
import { TemplateForm } from "@/components/templates/template-form";

interface Template {
  id: string;
  title: string;
  description: string | null;
  subjectId: string | null;
  estimatedMinutes: number | null;
  subject: { name: string; color: string | null } | null;
}

interface Subject {
  id: string;
  name: string;
}

interface TemplatesPageClientProps {
  templates: Template[];
  subjects: Subject[];
}

export function TemplatesPageClient({
  templates,
  subjects,
}: TemplatesPageClientProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingTemplate = editingId
    ? templates.find((t) => t.id === editingId)
    : undefined;

  const handleSuccess = () => {
    setShowForm(false);
    setEditingId(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Templates</h1>
          <p className="text-sm text-slate-500 mt-1">
            Save reusable assignment templates.
          </p>
        </div>
        {!showForm && !editingId && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-full transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Template
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            New Template
          </h2>
          <TemplateForm
            subjects={subjects}
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Edit form */}
      {editingTemplate && (
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Edit Template
          </h2>
          <TemplateForm
            subjects={subjects}
            template={editingTemplate}
            onSuccess={handleSuccess}
            onCancel={() => setEditingId(null)}
          />
        </div>
      )}

      {/* Template grid */}
      {templates.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">
            No templates yet
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Create templates for assignments you use often.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-full transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={(id) => {
                setShowForm(false);
                setEditingId(id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
