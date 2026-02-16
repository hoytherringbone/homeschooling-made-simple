"use client";

import { useState } from "react";
import { PartyPopper } from "lucide-react";
import { completeOnboarding } from "@/lib/actions/onboarding";
import { useSession } from "next-auth/react";

interface CompleteStepProps {
  studentsCount: number;
  subjectsCount: number;
}

export function CompleteStep({ studentsCount, subjectsCount }: CompleteStepProps) {
  const { update } = useSession();
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    await completeOnboarding();
    // Force JWT token refresh so middleware sees onboarded=true
    await update();
    window.location.href = "/dashboard";
  };

  return (
    <div className="text-center py-4">
      <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <PartyPopper className="w-7 h-7 text-teal-600" strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-semibold text-slate-900 mb-3">
        You&apos;re all set!
      </h2>
      <p className="text-sm text-slate-500 mb-2">
        Your homeschool is ready to go.
      </p>
      <div className="flex justify-center gap-6 text-sm text-slate-600 mb-8">
        <span>
          <strong className="text-slate-900">{studentsCount}</strong>{" "}
          {studentsCount === 1 ? "student" : "students"}
        </span>
        <span className="text-slate-300">|</span>
        <span>
          <strong className="text-slate-900">{subjectsCount}</strong>{" "}
          {subjectsCount === 1 ? "subject" : "subjects"}
        </span>
      </div>
      <button
        onClick={handleComplete}
        disabled={loading}
        className="bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white rounded-full px-8 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98]"
      >
        {loading ? "Setting up..." : "Go to Dashboard"}
      </button>
    </div>
  );
}
