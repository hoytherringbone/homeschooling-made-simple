"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MONTH_NAMES } from "@/lib/utils/calendar";

interface CalendarHeaderProps {
  year: number;
  month: number; // 0-indexed
}

export function CalendarHeader({ year, month }: CalendarHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigate = (newYear: number, newMonth: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", String(newYear));
    params.set("month", String(newMonth + 1)); // URL uses 1-indexed
    router.push(`/calendar?${params.toString()}`);
  };

  const goToPrev = () => {
    if (month === 0) {
      navigate(year - 1, 11);
    } else {
      navigate(year, month - 1);
    }
  };

  const goToNext = () => {
    if (month === 11) {
      navigate(year + 1, 0);
    } else {
      navigate(year, month + 1);
    }
  };

  const goToToday = () => {
    const now = new Date();
    navigate(now.getFullYear(), now.getMonth());
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-slate-900">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button
          onClick={goToToday}
          className="text-xs text-teal-600 hover:text-teal-700 font-medium px-2.5 py-1 rounded-full border border-teal-200 hover:bg-teal-50 transition-colors"
        >
          Today
        </button>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={goToPrev}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={goToNext}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
