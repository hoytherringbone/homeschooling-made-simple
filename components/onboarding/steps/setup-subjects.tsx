"use client";

import { useState } from "react";
import { Plus, BookOpen, ArrowLeft } from "lucide-react";
import { DEFAULT_SUBJECTS, SUBJECT_COLORS } from "@/lib/constants";
import { createSubjects } from "@/lib/actions/onboarding";
import type { SubjectInput } from "@/lib/validations/onboarding";

interface SetupSubjectsStepProps {
  familyId: string;
  onComplete: (subjects: SubjectInput[]) => void;
  onBack: () => void;
}

export function SetupSubjectsStep({ familyId, onComplete, onBack }: SetupSubjectsStepProps) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(DEFAULT_SUBJECTS.slice(0, 5)),
  );
  const [customSubject, setCustomSubject] = useState("");
  const [customSubjects, setCustomSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allSubjects = [...DEFAULT_SUBJECTS, ...customSubjects];

  const toggleSubject = (name: string) => {
    const next = new Set(selected);
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    setSelected(next);
  };

  const addCustomSubject = () => {
    const trimmed = customSubject.trim();
    if (!trimmed) return;
    if (allSubjects.includes(trimmed)) return;
    setCustomSubjects([...customSubjects, trimmed]);
    setSelected(new Set([...selected, trimmed]));
    setCustomSubject("");
  };

  const handleSubmit = async () => {
    if (selected.size === 0) {
      setError("Select at least one subject");
      return;
    }

    setLoading(true);
    setError(null);

    const subjects: SubjectInput[] = Array.from(selected).map((name, i) => ({
      name,
      color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
    }));

    const result = await createSubjects(familyId, subjects);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    onComplete(subjects);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-amber-600" strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Set up your subjects
          </h2>
          <p className="text-sm text-slate-500">
            Select the subjects you teach. You can customize these anytime.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 text-sm rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {allSubjects.map((name) => (
          <button
            key={name}
            onClick={() => toggleSubject(name)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
              selected.has(name)
                ? "bg-teal-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-8">
        <input
          type="text"
          value={customSubject}
          onChange={(e) => setCustomSubject(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustomSubject()}
          placeholder="Add a custom subject..."
          className="flex-1 rounded-xl border border-[#EDE9E3] bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
        />
        <button
          onClick={addCustomSubject}
          className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white rounded-full px-6 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98]"
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
