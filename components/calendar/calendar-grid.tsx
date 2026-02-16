import Link from "next/link";
import { WEEKDAY_NAMES, isSameDay } from "@/lib/utils/calendar";

interface CalendarAssignment {
  id: string;
  title: string;
  status: string;
  subject: { name: string; color: string | null } | null;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
}

interface CalendarGridProps {
  days: CalendarDay[];
  assignmentsByDate: Record<string, CalendarAssignment[]>;
  today: Date;
}

export function CalendarGrid({ days, assignmentsByDate, today }: CalendarGridProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#EDE9E3] overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-[#EDE9E3]">
        {WEEKDAY_NAMES.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-slate-500 py-2.5"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const key = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, "0")}-${String(day.date.getDate()).padStart(2, "0")}`;
          const assignments = assignmentsByDate[key] || [];
          const isToday = isSameDay(day.date, today);

          return (
            <div
              key={i}
              className={`min-h-[90px] border-b border-r border-[#EDE9E3] p-1.5 ${
                day.isCurrentMonth ? "bg-white" : "bg-slate-50/50"
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                <span
                  className={`text-xs w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday
                      ? "bg-teal-600 text-white font-bold"
                      : day.isCurrentMonth
                      ? "text-slate-700"
                      : "text-slate-300"
                  }`}
                >
                  {day.date.getDate()}
                </span>
              </div>
              <div className="space-y-0.5">
                {assignments.slice(0, 3).map((a) => (
                  <Link
                    key={a.id}
                    href={`/assignments/${a.id}`}
                    className="block group"
                  >
                    <div
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] leading-tight truncate transition-opacity hover:opacity-80 ${
                        a.status === "COMPLETED" ? "opacity-50" : ""
                      }`}
                      style={{
                        backgroundColor: `${a.subject?.color || "#94a3b8"}15`,
                        color: a.subject?.color || "#64748b",
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: a.subject?.color || "#94a3b8",
                        }}
                      />
                      <span className="truncate font-medium">{a.title}</span>
                    </div>
                  </Link>
                ))}
                {assignments.length > 3 && (
                  <span className="text-[10px] text-slate-400 px-1.5">
                    +{assignments.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
