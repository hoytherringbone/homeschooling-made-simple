"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ASSIGNMENT_STATUS } from "@/lib/constants";

interface FilterOption {
  value: string;
  label: string;
}

interface AssignmentFiltersProps {
  students: FilterOption[];
  subjects: FilterOption[];
  showStudentFilter?: boolean;
  showStatusFilter?: boolean;
}

export function AssignmentFilters({
  students,
  subjects,
  showStudentFilter = true,
  showStatusFilter = true,
}: AssignmentFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStudent = searchParams.get("student") || "";
  const currentSubject = searchParams.get("subject") || "";
  const currentStatus = searchParams.get("status") || "";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const selectClass =
    "rounded-xl border border-[#EDE9E3] bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all";

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {showStudentFilter && students.length > 0 && (
        <select
          value={currentStudent}
          onChange={(e) => updateFilter("student", e.target.value)}
          className={selectClass}
        >
          <option value="">All Students</option>
          {students.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      )}

      {subjects.length > 0 && (
        <select
          value={currentSubject}
          onChange={(e) => updateFilter("subject", e.target.value)}
          className={selectClass}
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      )}

      {showStatusFilter && (
        <select
          value={currentStatus}
          onChange={(e) => updateFilter("status", e.target.value)}
          className={selectClass}
        >
          <option value="">All Statuses</option>
          {Object.entries(ASSIGNMENT_STATUS).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label}
            </option>
          ))}
        </select>
      )}

      {(currentStudent || currentSubject || currentStatus) && (
        <button
          onClick={() => router.push(pathname)}
          className="text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2 transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
