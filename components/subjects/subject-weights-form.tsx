"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateSubjectWeights } from "@/lib/actions/subjects";
import { ASSIGNMENT_CATEGORIES } from "@/lib/constants";

interface SubjectWeightsFormProps {
  subjectId: string;
  existingWeights: { category: string; weight: number }[];
}

export function SubjectWeightsForm({ subjectId, existingWeights }: SubjectWeightsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [weights, setWeights] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const cat of ASSIGNMENT_CATEGORIES) {
      const existing = existingWeights.find((w) => w.category === cat.value);
      map[cat.value] = existing?.weight ?? 0;
    }
    return map;
  });

  const sum = Object.values(weights).reduce((s, w) => s + w, 0);
  const isValid = Math.round(sum) === 100;

  const handleChange = (category: string, value: string) => {
    const num = value === "" ? 0 : Math.max(0, Math.min(100, Number(value)));
    setWeights((prev) => ({ ...prev, [category]: num }));
  };

  const handleSave = () => {
    if (!isValid) return;
    const weightArray = ASSIGNMENT_CATEGORIES.map((cat) => ({
      category: cat.value,
      weight: weights[cat.value],
    }));

    startTransition(async () => {
      const result = await updateSubjectWeights(subjectId, weightArray);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Weights saved");
      }
    });
  };

  const hasWeights = existingWeights.length > 0;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {ASSIGNMENT_CATEGORIES.map((cat) => (
          <div key={cat.value} className="flex items-center gap-3">
            <span className="text-sm text-slate-700 w-24">{cat.label}</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={0}
                max={100}
                value={weights[cat.value] || ""}
                onChange={(e) => handleChange(cat.value, e.target.value)}
                placeholder="0"
                className="w-20 rounded-xl border border-[#EDE9E3] bg-white px-3 py-2 text-sm text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
              />
              <span className="text-sm text-slate-400">%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">Total:</span>
          <span
            className={`text-sm font-semibold ${
              isValid ? "text-green-600" : sum > 100 ? "text-rose-600" : "text-amber-600"
            }`}
          >
            {Math.round(sum)}%
          </span>
          {!isValid && sum > 0 && (
            <span className="text-xs text-slate-400">
              {sum < 100 ? `(${Math.round(100 - sum)}% remaining)` : `(${Math.round(sum - 100)}% over)`}
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={!isValid || isPending}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-full transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving..." : hasWeights ? "Update Weights" : "Save Weights"}
        </button>
      </div>
    </div>
  );
}
